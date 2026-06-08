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
  await dbInstance.collection('users').createIndex({ username: 1 });
  await dbInstance.collection('messages').createIndex({ user_id: 1, created_at: -1 });
  await dbInstance.collection('topics').createIndex({ user_id: 1, created_at: -1 });

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
      previous_api_keys: [],
      active_topic_id: `topic_${Date.now()}`,
      created_at: new Date()
    };
    const result = await db.collection('users').insertOne(newUser);
    user = { _id: result.insertedId, ...newUser };
  } else if (username && user.username !== username) {
    // Update username if it changed
    await db.collection('users').updateOne({ _id: user._id }, { $set: { username } });
    user.username = username;
  }
  
  if (!user.active_topic_id) {
    const newTopicId = `topic_${Date.now()}`;
    await db.collection('users').updateOne({ _id: user._id }, { $set: { active_topic_id: newTopicId } });
    user.active_topic_id = newTopicId;
  }
  
  return { 
    ...user, 
    id: user._id.toString(),
    hfApiKey: user.hf_api_key,
    name: user.name,
    activeTopicId: user.active_topic_id,
    memory: user.memory
  };
}

export async function getUserByUsernameOrId(identifier: string) {
  const db = await getDb();
  // Remove @ if user typed it and trim spaces
  const cleanIdentifier = identifier.trim().replace(/^@/, '');
  
  const user = await db.collection('users').findOne({
    $or: [
      { telegram_id: cleanIdentifier },
      { username: { $regex: new RegExp(`^${cleanIdentifier}$`, 'i') } }
    ]
  });
  
  if (user) {
    return { 
      ...user, 
      id: user._id.toString(),
      hfApiKey: user.hf_api_key,
      name: user.name,
      memory: user.memory
    };
  }
  return null;
}

export async function registerOrUpdateUserWeb(identifier: string, apiKey: string) {
  const db = await getDb();
  const cleanIdentifier = identifier.trim().replace(/^@/, '');
  
  let user = await db.collection('users').findOne({
    $or: [
      { telegram_id: cleanIdentifier },
      { username: { $regex: new RegExp(`^${cleanIdentifier}$`, 'i') } }
    ]
  });

  if (user) {
    // User exists, check API key
    if (user.hf_api_key !== apiKey) {
      // Store old key if it exists and is not already in previous_api_keys
      const previousKeys = user.previous_api_keys || [];
      if (user.hf_api_key && !previousKeys.includes(user.hf_api_key)) {
        previousKeys.push(user.hf_api_key);
      }
      await db.collection('users').updateOne(
        { _id: user._id },
        { 
          $set: { hf_api_key: apiKey, previous_api_keys: previousKeys }
        }
      );
    }
    return await getUserByUsernameOrId(identifier);
  } else {
    // Create new user
    const isNumeric = /^\d+$/.test(cleanIdentifier);
    const newUser = {
      telegram_id: isNumeric ? cleanIdentifier : `web_${Date.now()}`,
      name: cleanIdentifier,
      username: isNumeric ? '' : cleanIdentifier,
      hf_api_key: apiKey,
      previous_api_keys: [],
      created_at: new Date()
    };
    const result = await db.collection('users').insertOne(newUser);
    return { 
      ...newUser, 
      _id: result.insertedId,
      id: result.insertedId.toString(),
      hfApiKey: newUser.hf_api_key,
      memory: undefined
    };
  }
}

export async function setActiveTopic(userId: string | number, topicId: string) {
  const db = await getDb();
  await db.collection('users').updateOne(
    { telegram_id: userId.toString() },
    { $set: { active_topic_id: topicId } }
  );
}

export async function updateUserApiKey(telegramId: string | number, apiKey: string) {
  const db = await getDb();
  const idStr = telegramId.toString();
  const user = await db.collection('users').findOne({ telegram_id: idStr });
  
  if (user) {
    const previousKeys = user.previous_api_keys || [];
    if (user.hf_api_key && user.hf_api_key !== apiKey && !previousKeys.includes(user.hf_api_key)) {
      previousKeys.push(user.hf_api_key);
    }
    await db.collection('users').updateOne(
      { telegram_id: idStr },
      { $set: { hf_api_key: apiKey, previous_api_keys: previousKeys } }
    );
  }
}

export async function addMessage(userId: string | number, role: string, content: string, topicId?: string) {
  const db = await getDb();
  await db.collection('messages').insertOne({
    user_id: userId.toString(),
    role,
    content,
    topic_id: topicId || 'default',
    created_at: new Date()
  });
}

export async function getChatHistory(userId: string | number, limit = 10, topicId?: string) {
  const db = await getDb();
  const query: any = { user_id: userId.toString() };
  if (topicId) {
    query.topic_id = topicId;
  }
  
  const messages = await db.collection('messages')
    .find(query)
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray();
    
  return messages.map(m => ({ role: m.role, content: m.content }));
}

export async function clearChatHistory(userId: string | number) {
  // Instead of deleting, we just don't do anything here, or we could mark the current topic as closed.
  // The actual "new chat" logic will just generate a new topic ID.
}

export async function resetDatabase(userId: string | number) {
  const db = await getDb();
  await db.collection('messages').deleteMany({ user_id: userId.toString() });
  await db.collection('topics').deleteMany({ user_id: userId.toString() });
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

export async function saveTopic(userId: string | number, topicId: string, title: string) {
  const db = await getDb();
  await db.collection('topics').updateOne(
    { user_id: userId.toString(), topic_id: topicId },
    { $set: { title, created_at: new Date() } },
    { upsert: true }
  );
}

export async function getTopics(userId: string | number) {
  const db = await getDb();
  return await db.collection('topics')
    .find({ user_id: userId.toString() })
    .sort({ created_at: -1 })
    .toArray();
}

export async function savePollMapping(userId: string | number, pollId: string, topicId: string, question: string, options: string[]) {
  const db = await getDb();
  await db.collection('polls').insertOne({
    user_id: userId.toString(),
    poll_id: pollId,
    topic_id: topicId,
    question,
    options,
    created_at: new Date()
  });
}

export async function getPollMapping(pollId: string) {
  const db = await getDb();
  return await db.collection('polls').findOne({ poll_id: pollId });
}

export async function updateUserMemory(userId: string | number, memoryText: string) {
  const db = await getDb();
  await db.collection('users').updateOne(
    { telegram_id: userId.toString() },
    { $set: { memory: memoryText } }
  );
}

