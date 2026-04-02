import urllib.request
url = "https://raw.githubusercontent.com/Aadityasamriya/HFAPI/main/requirements.txt"
response = urllib.request.urlopen(url)
print(response.read().decode('utf-8'))
