import axios from 'axios';
import fs from 'fs';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

const BASE_URL = 'http://localhost:5000'; 
const TOTAL_USERS = 1000;
const BATCH_SIZE = 200; 

const csvWriter = createCsvWriter({
  path: 'test_users.csv',
  header: [
    { id: 'username', title: 'Username' },
    { id: 'email', title: 'Email' },
    { id: 'password', title: 'Password' },
    { id: 'role', title: 'Role' },
    { id: 'response', title: 'Response' } 
  ]
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const start = Date.now();
  const results = [];

  const createUser = async (id) => {
    const user = {
      username: `usertest${id}`,
      email: `usertest${id}@gmail.com`,
      password: '123456',
      role: 'student'
    };

    try {
      const res = await axios.post(`${BASE_URL}/auth/signup`, user);
      
      return { 
        ...user, 
        status: res.status, 
        response: JSON.stringify(res.data) 
      };
    } catch (err) {
      return { 
        ...user, 
        response: JSON.stringify(err.response?.data || 'error') 
      };
    }
  };

  const userIds = Array.from({ length: TOTAL_USERS }, (_, i) => (i + 1).toString().padStart(3, '0'));

  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    const batch = userIds.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(id => createUser(id)));
    results.push(...batchResults);
  }

  const end = Date.now();
  const executionTime = `Thời gian thực hiện: ${(end - start) / 1000} giây`;

  await csvWriter.writeRecords(results);

  fs.appendFileSync('test_users.csv', `\n${executionTime}`);

  console.log(`Đã tạo ${TOTAL_USERS} tài khoản trong ${(end - start) / 1000} giây`);
})();