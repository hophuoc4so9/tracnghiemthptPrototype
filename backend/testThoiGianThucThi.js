import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = "http://backend:5000";
let AUTH_TOKEN = "";

const authenticate = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: "hophuoc4so9@gmail.com",
      password: "123456",
    });

    const cookie = response.headers["set-cookie"][0];
    AUTH_TOKEN = cookie.split("=")[1].split(";")[0];
    console.log("Authentication successful.");
  } catch (error) {
    console.error("Authentication failed:", error.message);
    process.exit(1);
  }
};

const logToCSV = (filename, data, apiName) => {
  const header = "API Name,Request Number,Email,Response Time (ms),Status\n";
  const content = data
    .map(
      (row) =>
        `${apiName},${row.requestNumber},${row.email},${row.responseTime},${row.status}`
    )
    .join("\n");
  fs.writeFileSync(path.join(__dirname, `${filename}.csv`), header + content);
};

const measureResponseTime = async (endpoint, iteration) => {
  const results = [];

  for (let i = 0; i < iteration; i++) {
    const userIndex = String(i + 1).padStart(3, "0");
    const email = `usertest${userIndex}@gmail.com`;
    const username = `usertest${userIndex}`;
    let status = "error";
    const start = Date.now();

    try {
      const config = {
        headers: {
          ...endpoint.headers,
        },
      };

      let data = { ...endpoint.data };
      if (endpoint.name === "Register" || endpoint.name === "Login") {
        data = {
          ...data,
          email,
          username,
        };
      }

      const response = await axios[endpoint.method](endpoint.url, data, config);
      status = response.status === 200 ? 200 : response.status;
    } catch (err) {
      if (err.response) {
        status = err.response.status;
      }
    }

    const end = Date.now();
    results.push({
      requestNumber: i + 1,
      email,
      responseTime: end - start,
      status,
    });

    // Submit Exam nếu Join thành công
    if (endpoint.name === "Join Exam" && status === 200) {
      await submitExam(email, results, i + 1);
    }
  }

  logToCSV(endpoint.name.replace(/ /g, "_"), results, endpoint.name);
};

const submitExam = async (email, results, requestNumber) => {
  let resultId = null;

  try {
    const joinRes = await axios.get(
      `${BASE_URL}/exam/exam-practice/680da4b6b37b59528452f84d`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
    resultId = joinRes.data.resultId;
  } catch {
    results.push({
      requestNumber,
      email,
      responseTime: 0,
      status: "join_failed",
    });
    return;
  }

  const start = Date.now();
  let status = "error";
  try {
    const submitRes = await axios.post(
      `${BASE_URL}/result/submit`,
      {
        resultId,
        answers: [
          {
            questionId: "67f8d5cdbbf80c0887a65da2",
            selectedAnswerId: "67f8d5cdbbf80c0887a65da5",
            questionType: "6742fb1cd56a2e75dbd817ea",
          },
          {
            questionId: "67f8d5cdbbf80c0887a65dca",
            selectedAnswerId: "67f8d5cdbbf80c0887a65dcd",
            questionType: "6742fb1cd56a2e75dbd817ea",
          },
          {
            questionId: "67f8d5cdbbf80c0887a65db6",
            selectedAnswerId: "67f8d5cdbbf80c0887a65dba",
            questionType: "6742fb1cd56a2e75dbd817ea",
          },
          {
            questionId: "67f8d5cdbbf80c0887a65dc5",
            selectedAnswerId: "67f8d5cdbbf80c0887a65dc6",
            questionType: "6742fb1cd56a2e75dbd817ea",
          },
          {
            questionId: "67f8d5cdbbf80c0887a65da7",
            selectedAnswerId: "67f8d5cdbbf80c0887a65da9",
            questionType: "6742fb1cd56a2e75dbd817ea",
          },
        ],
        listeningAnswers: [],
        unansweredQuestions: [],
        questionTypes: ["6742fb1cd56a2e75dbd817ea"],
      },
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
    status = submitRes.status;
  } catch (error) {
    if (error.response) {
      status = error.response.status;
    }
  }

  const end = Date.now();
  results.push({
    requestNumber,
    email,
    responseTime: end - start,
    status,
  });
};

const main = async () => {
  await authenticate();

  const endpoints = [
    {
      name: "Register",
      url: `${BASE_URL}/auth/signup`,
      method: "post",
      data: {
        password: "123456",
        role: "student",
      },
    },
    {
      name: "Login",
      url: `${BASE_URL}/auth/login`,
      method: "post",
      data: {
        password: "123456",
      },
    },
    {
      name: "Get All Exams",
      url: `${BASE_URL}/exam`,
      method: "get",
      data: {},
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    },
    {
      name: "Get Exam Detail",
      url: `${BASE_URL}/exam/detail/de-thi-so-1-VmrpM42o3`,
      method: "get",
      data: {},
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    },
    {
      name: "Join Exam",
      url: `${BASE_URL}/exam/exam-practice/680da4b6b37b59528452f84d`,
      method: "get",
      data: {},
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    },
  ];

  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint.name} 1000 times...`);
    await measureResponseTime(endpoint, 1000);
  }
};

main();
