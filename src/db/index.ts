import { MongoClient, Db, ObjectId } from 'mongodb';

let dbInstance: Db | null = null;
let clientInstance: MongoClient | null = null;

export async function getDb(): Promise<Db> {
  if (dbInstance) return dbInstance;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required to connect to MongoDB');
  }

  clientInstance = new MongoClient(uri);
  await clientInstance.connect();
  
  dbInstance = clientInstance.db(); // Uses the default DB in the URI
  
  // Ensure indexes for performance
  await dbInstance.collection('users').createIndex({ telegram_id: 1 }, { unique: true });
  await dbInstance.collection('messages').createIndex({ user_id: 1, created_at: -1 });

  return dbInstance;
}

export async function getUser(telegramId: string | number, firstName?: string, username?: string) {
  const db = await getDb();
  const idStr = telegramId.toString();
  let user = await db.collection('users').findOne({ telegram_id: idStr });
  
  if (!user) {
    const newUser = {
      telegram_id: idStr,
      name: firstName || 'User',
      username: username || '',
      hf_api_key: null,
      created_at: new Date()
    };
    const result = await db.collection('users').insertOne(newUser);
    user = { _id: result.insertedId, ...newUser };
  }
  
  // Map _id to id and hf_api_key to hfApiKey so the rest of the app works without changes
  return { 
    ...user, 
    id: user._id.toString(),
    hfApiKey: user.hf_api_key,
    name: user.name
  };
}

export async function updateUserApiKey(telegramId: string | number, apiKey: string) {
  const db = await getDb();
  await db.collection('users').updateOne(
    { telegram_id: telegramId.toString() },
    { $set: { hf_api_key: apiKey } }
  );
}

export async function addMessage(userId: string | number, role: string, content: string) {
  const db = await getDb();
  await db.collection('messages').insertOne({
    user_id: userId.toString(),
    role,
    content,
    created_at: new Date()
  });
}

export async function getChatHistory(userId: string | number, limit = 10) {
  const db = await getDb();
  const messages = await db.collection('messages')
    .find({ user_id: userId.toString() })
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray();
    
  return messages.map(m => ({ role: m.role, content: m.content }));
}

export async function clearChatHistory(userId: string | number) {
  const db = await getDb();
  await db.collection('messages').deleteMany({ user_id: userId.toString() });
}

export async function resetDatabase(userId: string | number) {
  const db = await getDb();
  await db.collection('messages').deleteMany({ user_id: userId.toString() });
  await db.collection('users').deleteOne({ telegram_id: userId.toString() });
}

export async function getStats() {
  const db = await getDb();
  const usersCount = await db.collection('users').countDocuments();
  const messagesCount = await db.collection('messages').countDocuments();
  return {
    users: usersCount,
    messages: messagesCount
  };
}

export async function getAllUsers() {
  const db = await getDb();
  return await db.collection('users').find({}).toArray();
}
