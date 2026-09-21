# EDUCATE Portal - Project Documentation

## 1. Problem Statement
Traditional educational certificates and identity cards are highly susceptible to forgery, tampering, and physical damage. Verifying the authenticity of paper-based or even conventional digital documents involves tedious, manual processes that are time-consuming and inefficient for employers and institutions. There is a critical need for a decentralized, secure, and instantly verifiable system for academic credentials and student identity to ensure trust and transparency.

## 2. Features
- **Admin Dashboard**: Comprehensive management tools for creating courses, managing batches, enrolling students, scheduling exams, processing results, issuing certificates, and approving/minting digital ID cards.
- **Candidate Dashboard**: A personalized portal for students to view enrolled courses, track upcoming exams, check semester results, request blockchain-backed ID cards, and access their verified certificates.
- **Dynamic Result & Grade Management**: Detailed management of marks and subjects dynamically based on the course type:
  - **Certificate Courses**: Direct evaluation with 2 core subjects.
  - **Diploma/Graduation Courses**: Semester-based evaluation featuring 5 subjects per semester. The final consolidated certificate is only generated after all semesters are successfully completed.
- **Blockchain-based Document Verification**: Generates a cryptographic hash of certificate, ID card, and individual semester result details, securely storing them on the Ethereum blockchain. This ensures absolute immutability and verifiable authenticity.
- **Decentralized Trust**: Secures academic credentials, semester results, and student identity on an immutable ledger, preventing unauthorized modifications.

## 3. Project Proposal with Feasibility Study
**Proposal**: To develop a decentralized education portal leveraging the MERN stack for robust data management and Web3 blockchain technology (Ethereum) to issue, store, and verify immutable academic certificates, ID cards, and semester-by-semester results.

**Feasibility Study**:
- **Technical Feasibility**: High. The MERN stack (MongoDB, Express, React, Node) is a proven architecture for scalable web applications. Ethereum and Hardhat provide an established ecosystem for smart contract development.
- **Operational Feasibility**: High. The user interface is designed to abstract blockchain complexities, making it user-friendly for non-technical administrators and students to request and mint Web3 documents.
- **Economic Feasibility**: The project utilizes local testnets (Hardhat) during development to ensure zero gas costs. For production, optimized smart contracts will minimize transaction fees (gas), making it a cost-effective solution for institutions.

## 4. System Analysis
The system operates around three primary domains: Administration, Student Portal, and the Blockchain Network.
- **Admin Domain**: Manages the core educational workflows—from course creation to ID card approvals, semester result uploads, and final certificate issuance.
- **Candidate Domain**: Allows students to access their educational records, request Web3 ID cards, view individual semester results, and access cryptographic certificates upon course completion.
- **Blockchain Domain**: Acts as the immutable ledger. When an ID card, semester result, or final certificate is generated, its unique hash and transaction details are permanently recorded on the blockchain.

## 5. Architecture Used
The system utilizes a hybrid Client-Server and Decentralized Web3 Architecture:
- **Frontend (Client)**: React.js, Vite, and Bootstrap for a responsive, dynamic User Interface.
- **Backend (Server)**: Node.js and Express.js providing RESTful APIs.
- **Database**: MongoDB with Mongoose ODM for structured data storage (Courses, Students, Exams, Results, ID Cards, etc.).
- **Blockchain**: Ethereum Network, Solidity Smart Contracts, Hardhat (local Ethereum node), and Ethers.js/Web3.js for seamless backend-to-blockchain communication.

## 6. Project Flow Using SDLC (Software Development Life Cycle)
1. **Requirement Analysis**: Identifying the vulnerability of traditional credentials and defining the need for a blockchain-based verification system.
2. **Design**: Architecting the database schemas (MongoDB), smart contract logic (Solidity), and UI/UX wireframes (React) to handle varying course types.
3. **Implementation/Coding**: Developing the REST APIs, building frontend components, and writing/deploying smart contracts.
4. **Testing**: Unit testing individual components, smart contract testing on the Hardhat node, and end-to-end integration testing.
5. **Deployment**: Deploying the frontend (e.g., Vercel), backend (e.g., AWS/Render), database (MongoDB Atlas), and smart contracts to an Ethereum testnet/mainnet.
6. **Maintenance**: Monitoring system health, managing database backups, and updating UI components based on user feedback.

## 7. Project Flow with Process
1. **Setup**: Admin creates a new `Course` (specifying if it is a Certificate or Diploma/Degree) and initializes a `Batch`.
2. **Onboarding**: Candidates sign up on the portal. Admin approves and assigns them to the active `Batch`.
3. **ID Card Request & Issuance**: 
   - Candidate requests an ID card from their dashboard.
   - Admin reviews pending ID card requests, approves, and mints the ID card to the Ethereum blockchain.
4. **Examination**: Admin schedules an `Exam` for the specific batch and semester.
5. **Evaluation & Result Minting**: 
   - Admin uploads the `Results` (marks, subjects, grades) for the candidates. 
   - **For Certificate courses:** 2 subjects are evaluated.
   - **For Diploma/Graduation courses:** 5 subjects are evaluated per semester.
   - *Crucially, each semester's result data is immediately anchored to the Ethereum Blockchain as an immutable record.*
6. **Final Certificate Issuance**: 
   - For Certificate courses, the certificate is generated immediately after the single exam result.
   - For Diploma/Graduation courses, the system ensures all requisite semesters are completed before the Admin can generate the final consolidated `Certificate`.
7. **Certificate Blockchain Anchoring**: The system calculates a cryptographic hash of the final certificate data and initiates a transaction to store it on the Ethereum Blockchain.
8. **Verification**: Any third party can verify the authenticity of a Certificate, ID Card, or a specific Semester Result in real-time by querying the blockchain using the unique ID or scanning the generated QR code.

## 8. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    ADMIN ||--o{ COURSE : manages
    ADMIN ||--o{ BATCH : manages
    ADMIN ||--o{ EXAM : schedules
    COURSE ||--o{ BATCH : has
    BATCH ||--o{ STUDENT : enrolls
    BATCH ||--o{ EXAM : includes
    EXAM ||--o{ RESULT : generates
    STUDENT ||--o{ RESULT : receives
    STUDENT ||--o{ CERTIFICATE : earns
    STUDENT ||--o{ IDCARD : requests
    BATCH ||--o{ CERTIFICATE : issues
    BATCH ||--o{ IDCARD : groups

    COURSE {
        string courseid PK
        string coursename
        string course_type
        number price
        number duration
    }
    BATCH {
        string batchcode PK
        string courseid FK
        date start_date
        date end_date
        string status
    }
    STUDENT {
        string sid PK
        string username
        string email
        string batchcode FK
        string role
    }
    EXAM {
        string examid PK
        string batchcode FK
        date exam_date
        string semester
    }
    RESULT {
        string resultid PK
        string examid FK
        string sid FK
        string semester
        number total_score
        string grade
        string current_hash
        string contract_address
    }
    CERTIFICATE {
        string crtid PK
        string sid FK
        string batchcode FK
        string previous_hash
        string current_hash
        string transaction_details
        string contract_address
    }
    IDCARD {
        string idCardId PK
        string sid FK
        string batchcode FK
        string status
        string current_hash
        string transaction_details
        string contract_address
    }
```

## 9. Data Flow Diagrams (DFD)

### Level 0 DFD (Context Diagram)
```mermaid
flowchart TD
    Admin([Admin])
    Student([Student/Candidate])
    Verifier([Third-Party Verifier])
    System((EDUCATE Portal \n Blockchain System))

    Admin -- Course/Batch/Result/ID Approval Data --> System
    System -- Dashboard Info --> Admin
    
    Student -- Registration Info & ID Request --> System
    System -- Dashboard/Certificate/ID Info --> Student
    
    Verifier -- Certificate/ID Card/Result ID --> System
    System -- Verification Status --> Verifier
```

### Level 1 DFD (Main Processes)
```mermaid
flowchart TD
    Admin([Admin])
    Student([Student])
    
    P1((1. User \n Management))
    P2((2. Academic \n Management))
    P3((3. Blockchain \n Integration))
    
    DB[(MongoDB)]
    BC[(Ethereum Blockchain)]

    Student -- Sign Up Details & ID Request --> P1
    Admin -- Approvals/Logins/ID Mints --> P1
    P1 <--> DB
    P1 -- ID Card Data --> P3

    Admin -- Courses, Batches, Exams, Semester Results --> P2
    P2 <--> DB
    P2 -- Certificate & Result Data --> P3

    P3 -- Hash Data --> BC
    BC -- Transaction Receipt --> P3
    P3 -- Final Cert/ID/Result Record --> DB
    
    Student -- View Results/Certificates/IDs --> P2
```

### Level 2 DFD (Document Generation Process)
```mermaid
flowchart TD
    P2_1((Fetch Student \n & Document Data))
    P2_2((Generate \n Cryptographic Hash))
    P2_3((Interact with \n Smart Contract))
    P2_4((Store Receipt \n in Database))
    
    DB[(MongoDB)]
    BC[(Ethereum Blockchain)]

    DB --> |Result/ID Request & Student Info| P2_1
    P2_1 --> P2_2
    P2_2 --> |Payload: Hash, Student ID| P2_3
    P2_3 --> |Send Transaction| BC
    BC --> |Transaction Hash, Block Num| P2_3
    P2_3 --> P2_4
    P2_4 --> |Update Document Record| DB
```

## 10. Testing
- **Unit Testing**: Isolating and testing individual React components (e.g., Dashboard metrics) and backend controllers (e.g., User authentication logic).
- **Smart Contract Testing**: Utilizing Hardhat and Chai to rigorously test the immutability, event emission, and retrieval functions of the Solidity contracts before deployment (including Certificate, IdCard, and Result minting functions).
- **Integration Testing**: Ensuring the Node.js backend correctly synchronizes data writes between MongoDB and the Ethereum node without race conditions.
- **Security Testing**: Auditing for common Web3 vulnerabilities (e.g., Reentrancy, Overflow) and traditional web vulnerabilities (e.g., XSS in React, NoSQL injection in MongoDB).

## 11. Deployment
- **Frontend Architecture**: Deployed as a static bundle using services like Vercel, Netlify, or AWS S3 & CloudFront for fast global delivery.
- **Backend Architecture**: Hosted on scalable platforms like AWS EC2, Heroku, or Render to handle API requests and blockchain interactions.
- **Database Layer**: Managed MongoDB Atlas cluster for a highly available, scalable NoSQL database.
- **Blockchain Layer**: Smart contracts are deployed to an Ethereum testnet (e.g., Sepolia) or Mainnet. The backend communicates with the network via RPC providers like Infura or Alchemy.

## 12. Security
- **Data Integrity (Blockchain)**: The primary security feature. Once a document's hash is anchored to the Ethereum blockchain, it is mathematically impossible to alter without invalidating the hash, guaranteeing authenticity.
- **Authentication & Authorization**: Role-based access control (Admin vs. Candidate) implemented using secure JWT (JSON Web Tokens) or session management.
- **Data Privacy**: Sensitive personal details (PII) are stored securely in MongoDB. Only the non-reversible cryptographic hash and public identifiers are exposed on the public blockchain, ensuring GDPR compliance.
- **Input Validation**: Strict Mongoose schemas and backend validation middleware enforce data types and constraints to prevent NoSQL injection and malformed data entry.


## Prerequisites
Before installing the dependencies, ensure you have the following installed on your system:
- Node.js (v16.x or higher recommended)
- npm (Node Package Manager)

### Step 1: Backend Dependencies
Navigate to the backend directory and install the necessary packages:
```bash
cd backend
npm install
```

**Dependencies:**
- `cors`: Middleware to enable Cross-Origin Resource Sharing.
- `ethers`: Library for interacting with the Ethereum Blockchain.
- `express`: Fast, unopinionated, minimalist web framework for Node.js.
- `mongoose`: MongoDB object modeling tool.
- `multer`: Node.js middleware for handling file uploads.

### Step 2: Frontend Dependencies
Navigate to the frontend directory and install the necessary packages:
```bash
cd frontend
npm install
```

**Dependencies:**
- `bootstrap`: CSS framework for responsive design.
- `ethers`: Library for interacting with the Ethereum Blockchain.
- `html2canvas`: Takes "screenshots" of webpages to build the certificate visually.
- `jspdf`: Library to generate PDFs (used for downloading documents).
- `qrcode.react`: React component to generate QR codes for verification.
- `react` & `react-dom`: Core React libraries for building the UI.
- `react-router-dom`: Declarative routing for React web applications.

**Dev Dependencies:**
Tools and plugins related to Vite, ESLint, and TypeScript declarations (`@eslint/js`, `@vitejs/plugin-react`, `vite`, etc.) for development.

### Step 3: Ethereum (Blockchain) Dependencies
Navigate to the ethereum directory and install the necessary packages:
```bash
cd ethereum
npm install
```

**Dev Dependencies:**
- `@nomicfoundation/hardhat-toolbox`: Bundles all the commonly used Hardhat plugins.
- `hardhat`: Ethereum development environment for compiling, testing, and deploying smart contracts locally.

**Dependencies:**
Various low-level tools required by the Ethereum ecosystem (`adm-zip`, `ethereum-cryptography`, `micro-eth-signer`, `tsx`, `zod`, etc.).

---

## Instructions

> **Note:** Your development servers are currently running for all three modules (`npx hardhat node`, `npm start` for backend, and `npm run dev` for frontend).

### 1. Ethereum Directory
Go to the Ethereum directory to start the local blockchain node (Ganache/Hardhat):
```powershell
cd .\ethereum\
npx hardhat node
```
Open another terminal for the Ethereum directory to deploy the smart contract to the local network:
```powershell
cd .\ethereum\
npx hardhat run scripts/deployCertificate.js --network localhost
```

### 2. Backend Directory
Start the backend server:
```powershell
cd .\backend\
npm start
```

### 3. Frontend Directory
Start the frontend development server:
```powershell
cd .\frontend\
npm run dev
```
The frontend should be accessible at `http://localhost:5173/`.

### Repository Link
[https://github.com/saikatssg/student-education-portal/tree/main](https://github.com/saikatssg/student-education-portal/tree/main)

### Project Screenshots 

<img width="1920" height="1080" alt="home2" src="https://github.com/user-attachments/assets/8f20d0e5-8a81-41ac-ac13-4c11fd1654d4" />
<img width="1920" height="1080" alt="home1" src="https://github.com/user-attachments/assets/efaeb3b7-3a49-4faa-ae64-bf8505f7e02e" />
<img width="1920" height="1080" alt="about" src="https://github.com/user-attachments/assets/8a214095-79b1-42ab-b0ee-366d538296c1" />
<img width="1920" height="1080" alt="contact" src="https://github.com/user-attachments/assets/5c86071f-5e57-4f5c-b673-246f76380e98" />
<img width="1920" height="1080" alt="signup" src="https://github.com/user-attachments/assets/e8bbad20-4087-4c23-a703-fca2eaf345b8" />
<img width="1920" height="1080" alt="logincheck" src="https://github.com/user-attachments/assets/fc98edba-2cdd-49f7-97ca-0397783421a7" />
<img width="1920" height="1080" alt="validUserLogin" src="https://github.com/user-attachments/assets/0b8383f6-5ed2-432e-9a5e-502e31677062" />
<img width="1920" height="1080" alt="adminDashboard" src="https://github.com/user-attachments/assets/15d8e6ac-010e-4a8a-b82d-f457ba9cd63f" />
<img width="1920" height="1080" alt="batchMaster" src="https://github.com/user-attachments/assets/60ff1c5f-e945-4568-9b83-f30bc4ac7739" />
<img width="1920" height="1080" alt="exam" src="https://github.com/user-attachments/assets/f1fa3878-de00-4c8b-b13c-2aa8a35c7558" />
<img width="1920" height="1080" alt="examSlot" src="https://github.com/user-attachments/assets/37e400a3-ba36-4be9-a1c4-e0bdf7cc226d" />
<img width="1920" height="1080" alt="result" src="https://github.com/user-attachments/assets/d95ed48c-bd2e-48ec-a14b-4daf705b1168" />
<img width="1920" height="1080" alt="resultcc" src="https://github.com/user-attachments/assets/e48314c2-643e-4620-b9eb-10e7f822af96" />
<img width="1920" height="1080" alt="reslutDegree" src="https://github.com/user-attachments/assets/8e29f5d1-ff0a-4ced-8bc0-c33e6c9866c5" />
<img width="1920" height="1080" alt="addmarks" src="https://github.com/user-attachments/assets/2a62cbc1-f4b4-49f6-a308-9b8bff9e35c6" />
<img width="1920" height="1080" alt="addrstoblock" src="https://github.com/user-attachments/assets/de5df69e-d2a2-4449-b9f9-58a459b4349b" />
<img width="1920" height="1080" alt="viewResult" src="https://github.com/user-attachments/assets/dafdbb4a-9e06-4659-92c8-3f33a58c769d" />
<img width="1920" height="1080" alt="certificate" src="https://github.com/user-attachments/assets/adf9c0fe-51fe-47d6-a189-c76eb0e60870" />
<img width="1920" height="1080" alt="generateCC" src="https://github.com/user-attachments/assets/7b6c2978-2abe-4e28-b75e-7a2f8255238c" />
<img width="1920" height="1080" alt="currentDegreers" src="https://github.com/user-attachments/assets/f787a9cb-f7ba-4952-ad25-0180d7253182" />
<img width="1920" height="1080" alt="idRequest" src="https://github.com/user-attachments/assets/702f6cc4-10ff-43a3-ae18-ec8537f4ab33" />
<img width="1920" height="1080" alt="studentView" src="https://github.com/user-attachments/assets/09c0c65b-a2bf-4802-9fc0-169f5a6c55b2" />
<img width="1920" height="1080" alt="viewStudent" src="https://github.com/user-attachments/assets/f0dcaf33-e684-4c8b-a4eb-96a75303550c" />
<img width="1920" height="1080" alt="generateID" src="https://github.com/user-attachments/assets/76a871d0-ae60-4fdf-b2ef-b7a680061a18" />
<img width="1920" height="1080" alt="generatedID" src="https://github.com/user-attachments/assets/01d16f6c-5ed6-4548-b581-bd02a7754631" />
<img width="1920" height="1080" alt="candidateDashboard" src="https://github.com/user-attachments/assets/a6458d42-569a-42ce-96e1-03b2e600d58c" />
<img width="872" height="543" alt="Screenshot 2026-09-21 134325" src="https://github.com/user-attachments/assets/3eee6a8f-a326-4a47-927e-a41a1205d074" />
<img width="1920" height="1080" alt="candidateDashboard2" src="https://github.com/user-attachments/assets/b667a546-abb5-4b0d-ab9b-48c3514cc8a2" />
<img width="1920" height="1080" alt="candidateCertificate" src="https://github.com/user-attachments/assets/9fb521da-af9e-4d5f-a623-5a5e4467d7bf" />
<img width="1920" height="1080" alt="enrollNew" src="https://github.com/user-attachments/assets/fff8afd2-5629-448e-a2c4-a1922f8b5078" />
<img width="1920" height="1080" alt="requestId" src="https://github.com/user-attachments/assets/ab30067a-5db4-4031-ba20-7b2cd19d592b" />
<img width="1920" height="1080" alt="addExamSlot" src="https://github.com/user-attachments/assets/f91a465e-60a6-485b-a69c-8f9506a3cba6" />
<img width="1920" height="1080" alt="idApproval" src="https://github.com/user-attachments/assets/0daef29b-d0c2-4373-b2e0-18bf31c3a506" />
<img width="1920" height="1080" alt="payment" src="https://github.com/user-attachments/assets/5f875d69-5788-4e10-a6a4-9e89eb152784" />
<img width="1920" height="1080" alt="approvedId" src="https://github.com/user-attachments/assets/08e98c9d-7d06-4a6d-9ca9-6b8b420e8039" />
<img width="1920" height="1080" alt="multiCourse" src="https://github.com/user-attachments/assets/47526c7b-53d1-458c-aa9a-034c9a6d6028" />
<img width="1920" height="1080" alt="AddResult" src="https://github.com/user-attachments/assets/78095be5-73b0-415b-a9df-1ac1a8a54715" />
<img width="1920" height="1080" alt="resultGenerate" src="https://github.com/user-attachments/assets/37b29583-588c-4932-9dd6-8af255afdc27" />
<img width="1920" height="1080" alt="ResultGenerateBlock" src="https://github.com/user-attachments/assets/6de342d4-a657-4921-8a7b-a69cf39ccbbf" />
<img width="1920" height="1080" alt="emmadashboard" src="https://github.com/user-attachments/assets/1f515423-d26c-4e5f-b029-5abab054e52a" />

