



const { createClient } = require('redis');

const client = createClient({
    username: 'default',
    password: 'wMXadgCh7qzGyXF2w9wdZ1UlsZmuDuCJ',
    socket: {
        host: 'redis-11546.c261.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 11546
    }
});

client.on('error', err => console.log('Redis Client Error', err));

client.connect();


// دالة لحفظ بيانات في الكاش
const setCache = async (key, value, ttl = 3600) => {
    try {
      await client.set(key, value, { EX: ttl });
    } catch (err) {
      console.error('❌ Redis setCache error:', err);
    }
  };
  
  // دالة لاسترجاع بيانات من الكاش
  const getCache = async (key) => {
    try {
      return await client.get(key);
    } catch (err) {
      console.error('❌ Redis getCache error:', err);
      return null;
    }
  };
  
  // دالة لحذف بيانات من الكاش
  const delCache = async (key) => {
    try {
      await client.del(key);
    } catch (err) {
      console.error('❌ Redis delCache error:', err);
    }
  };
  
  
setCache('foo', 'bar').then(() => {
    console.log('✅ Redis setCache success');
});
const result = getCache('foo').then((result) => {
    console.log(result)  // >>> bar
});
module.exports = { setCache, getCache, delCache };
