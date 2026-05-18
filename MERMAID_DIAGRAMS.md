# LegalConnect - Mermaid Diagrams

This file contains all Mermaid code for the diagrams referenced in the SRS document.

---

## 1. Context Diagram (Level 0 - System Overview)

```mermaid
graph TB
    Client["👤 Client/User"]
    Lawyer["⚖️ Lawyer"]
    Admin["👨‍💼 Administrator"]
    System["LegalConnect<br/>System"]
    PaymentGateway["💳 Payment<br/>Gateway"]
    EmailService["📧 Email<br/>Service"]
    FileStorage["☁️ File<br/>Storage"]

    Client -->|Register, Book, Consult| System
    Lawyer -->|Manage Profile, Accept Bookings| System
    Admin -->|Manage Platform| System
    System -->|Process Payment| PaymentGateway
    System -->|Send Emails| EmailService
    System -->|Store Documents| FileStorage
    PaymentGateway -->|Payment Status| System
    EmailService -->|Delivery Status| System
    FileStorage -->|File Access| System
```

---

## 2. Data Flow Diagram (Level 1 - Main Processes)

```mermaid
graph TB
    subgraph Input["Input Sources"]
        A["User Input"]
        B["API Requests"]
        C["Payment Webhooks"]
    end

    subgraph Processing["Core Processes"]
        P1["1.0<br/>User & Auth<br/>Management"]
        P2["2.0<br/>Lawyer Profile<br/>Management"]
        P3["3.0<br/>Consultation<br/>Processing"]
        P4["4.0<br/>Payment<br/>Processing"]
        P5["5.0<br/>Document<br/>Management"]
        P6["6.0<br/>Messaging &<br/>Support"]
    end

    subgraph Storage["Data Storage"]
        D1["User Data"]
        D2["Lawyer Profiles"]
        D3["Consultations"]
        D4["Payments"]
        D5["Documents"]
        D6["Messages"]
    end

    subgraph Output["Output Services"]
        E1["Email Notifications"]
        E2["Real-time Updates"]
        E3["Reports"]
    end

    A --> P1
    B --> P2
    B --> P3
    C --> P4
    B --> P5
    B --> P6

    P1 --> D1
    P2 --> D2
    P3 --> D3
    P4 --> D4
    P5 --> D5
    P6 --> D6

    D1 --> E1
    D3 --> E2
    D4 --> E1
    D6 --> E2
    D1 --> E3
```

---

## 3. Entity Relationship Diagram (ERD - Database Schema)

```mermaid
erDiagram
    USERS ||--o{ CONSULTATIONS : books
    USERS ||--o{ DOCUMENTS : requests
    USERS ||--o{ MESSAGES : sends
    USERS ||--o{ HELP_TICKETS : creates
    USERS ||--o{ RATINGS : gives
    USERS ||--o{ PAYMENTS : makes

    LAWYER_PROFILES ||--o{ CONSULTATIONS : accepts
    LAWYER_PROFILES ||--o{ DOCUMENTS : prepares
    LAWYER_PROFILES ||--o{ RATINGS : receives
    LAWYER_PROFILES ||--o{ SPECIALIZATIONS : has

    SPECIALIZATIONS ||--o{ LAWYER_PROFILES : categorizes

    CONSULTATIONS ||--o{ CONSULTATION_PAYMENTS : charged
    CONSULTATIONS ||--o{ RATINGS : reviewed

    DOCUMENTS ||--o{ DOCUMENT_PAYMENTS : charged
    DOCUMENTS ||--o{ DOCUMENT_TYPES : classifies

    DOCUMENT_TYPES ||--o{ DOCUMENTS : defines

    PAYMENTS ||--o{ HELP_TICKETS : disputes

    HELP_TICKETS ||--o{ HELP_REPLIES : answered

    REGIONS ||--o{ USERS : located
    REGIONS ||--o{ LAWYER_PROFILES : serving

    ADMIN_LOGS ||--o{ USERS : monitors
```

---

## 4. Use Case Diagram - All Actors and Use Cases

```mermaid
graph TB
    subgraph Client["🔵 CLIENT USE CASES"]
        UC1["Register/Login"]
        UC2["Search Lawyers"]
        UC3["Book Consultation"]
        UC4["Request Document"]
        UC5["Send Message"]
        UC6["Submit Ticket"]
        UC7["Rate Lawyer"]
        UC8["Track Payment"]
        UC9["View History"]
        UC10["Manage Profile"]
    end

    subgraph Lawyer["🟢 LAWYER USE CASES"]
        UC11["Register/Login"]
        UC12["Manage Profile"]
        UC13["Set Availability"]
        UC14["Accept Consultation"]
        UC15["Prepare Document"]
        UC16["View Earnings"]
        UC17["Respond Messages"]
        UC18["View Reviews"]
        UC19["Manage Specialization"]
    end

    subgraph Admin["🔴 ADMIN USE CASES"]
        UC20["Manage Users"]
        UC21["Manage Lawyers"]
        UC22["Manage Specializations"]
        UC23["View Reports"]
        UC24["Handle Disputes"]
        UC25["View Audit Logs"]
        UC26["System Configuration"]
        UC27["Monitor Performance"]
        UC28["Manage Help Tickets"]
    end

    style Client fill:#e1f5ff
    style Lawyer fill:#e8f5e9
    style Admin fill:#ffebee
```

---

## 5. Sequence Diagram - Consultation Booking Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Server
    participant DB as Database
    participant PG as Payment Gateway
    participant Email as Email Service

    C->>API: Search and view lawyer profile
    API->>DB: Query lawyer details
    DB-->>API: Lawyer profile data
    API-->>C: Display lawyer profile

    C->>API: Request consultation booking
    API->>DB: Check availability
    DB-->>API: Available slots
    API-->>C: Show available slots

    C->>API: Confirm booking with payment
    API->>PG: Process payment
    PG-->>API: Payment successful
    API->>DB: Create consultation record
    API->>DB: Update lawyer availability
    DB-->>API: Records created

    API->>Email: Send confirmation to client
    API->>Email: Send notification to lawyer
    Email-->>C: Confirmation email
    Email-->>API: Email sent status
    API-->>C: Booking confirmed
```

---

## 6. State Diagram - Consultation Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: Booking Requested
    Pending --> Confirmed: Payment Processed
    Confirmed --> InProgress: Consultation Time Starts
    InProgress --> Completed: Consultation Ends
    Completed --> Reviewed: Client Rates Lawyer
    Reviewed --> [*]: Closed

    Pending --> Cancelled: Payment Failed
    Confirmed --> Cancelled: User Cancels Before 24h
    Cancelled --> [*]: Closed

    note right of Pending
        Awaiting payment
        30 min timeout
        Initial state
    end note

    note right of Confirmed
        Payment processed
        24h before send reminder
        Lawyer notified
    end note

    note right of InProgress
        Meeting happening
        Can use messaging
        Real-time updates
    end note

    note right of Completed
        Can rate lawyer
        Can request document
        Generate receipt
    end note

    note right of Reviewed
        Rating submitted
        Update lawyer rating
        Send thank you email
    end note
```

---

## 7. Deployment Architecture Diagram

```mermaid
graph TB
    subgraph Client["👥 CLIENT LAYER"]
        Web["Web Browser<br/>Vue.js App<br/>Responsive Design"]
        Mobile["Mobile Browser<br/>Mobile Responsive<br/>PWA Support"]
    end

    subgraph CDN["📡 CDN LAYER"]
        CloudFront["CloudFront<br/>Static Assets<br/>Caching"]
    end

    subgraph LB["⚖️ LOAD BALANCING"]
        ALB["Application<br/>Load Balancer<br/>AWS ALB"]
    end

    subgraph App["🖥️ APPLICATION SERVERS"]
        Server1["Laravel Server 1<br/>PHP 8.2<br/>Instance 1"]
        Server2["Laravel Server 2<br/>PHP 8.2<br/>Instance 2"]
        Server3["Laravel Server N<br/>PHP 8.2<br/>Instance N"]
    end

    subgraph Cache["💾 CACHING LAYER"]
        Redis["Redis Cache<br/>Session Storage<br/>Data Cache"]
    end

    subgraph DB["🗄️ DATABASE LAYER"]
        Primary["MySQL Primary<br/>Read/Write<br/>Master"]
        Replica1["MySQL Replica 1<br/>Read Only<br/>Standby"]
        Replica2["MySQL Replica 2<br/>Read Only<br/>Backup"]
    end

    subgraph Storage["☁️ STORAGE LAYER"]
        S3["AWS S3<br/>Document Storage<br/>File Backup"]
    end

    subgraph External["🔗 EXTERNAL SERVICES"]
        Stripe["Stripe API<br/>Payment Processing<br/>PCI Compliant"]
        SES["AWS SES<br/>Email Service<br/>Transactional"]
    end

    Web --> CloudFront
    Mobile --> CloudFront
    CloudFront --> ALB

    ALB --> Server1
    ALB --> Server2
    ALB --> Server3

    Server1 --> Redis
    Server2 --> Redis
    Server3 --> Redis

    Server1 --> Primary
    Server2 --> Primary
    Server3 --> Primary

    Primary --> Replica1
    Primary --> Replica2

    Server1 --> S3
    Server2 --> S3
    Server3 --> S3

    Server1 --> Stripe
    Server2 --> Stripe
    Server3 --> Stripe

    Server1 --> SES
    Server2 --> SES
    Server3 --> SES

    style Client fill:#e3f2fd
    style CDN fill:#f3e5f5
    style LB fill:#fff3e0
    style App fill:#e8f5e9
    style Cache fill:#fce4ec
    style DB fill:#f1f8e9
    style Storage fill:#e0f2f1
    style External fill:#ffe0b2
```

---

## 8. Document Request Process Flow

```mermaid
graph LR
    A["Client Requests<br/>Document"] --> B["Payment<br/>Processed"]
    B --> C["Lawyer<br/>Notified"]
    C --> D["Lawyer<br/>Prepares"]
    D --> E["Document<br/>Ready"]
    E --> F["Client<br/>Notified"]
    F --> G["Download<br/>Available"]
    G --> H["Delivery<br/>Complete"]

    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style E fill:#fce4ec
    style F fill:#e0f2f1
    style G fill:#f1f8e9
    style H fill:#c8e6c9
```

---

## 9. Help Ticket Resolution Flow

```mermaid
graph TB
    A["User Creates<br/>Help Ticket"]
    B["Ticket Assigned<br/>to Admin"]
    C["Admin Reviews<br/>Ticket"]
    D{Resolution<br/>Path?}
    E["Admin Responds<br/>with Solution"]
    F["User Feedback<br/>Requested"]
    G{Issue<br/>Resolved?}
    H["Ticket Closed"]
    I["Escalate to<br/>Senior Admin"]
    J["Ticket Status:<br/>Escalated"]

    A --> B
    B --> C
    C --> D
    D -->|Simple Issue| E
    D -->|Complex Issue| I
    E --> F
    F --> G
    G -->|Yes| H
    G -->|No| I
    I --> J

    style A fill:#bbdefb
    style H fill:#a5d6a7
    style I fill:#ffab91
    style J fill:#ffe0b2
```

---

## 10. Authentication Flow Diagram

```mermaid
graph TD
    A["User Submits<br/>Credentials"]
    B{Valid<br/>Credentials?}
    C["Generate JWT<br/>Token"]
    D["Return Token<br/>to Client"]
    E["Client Stores<br/>Token"]
    F["Client Sends<br/>Token in Header"]
    G["Server Validates<br/>Token"]
    H{Token<br/>Valid?}
    I["Grant Access<br/>to Resource"]
    J["Return 401<br/>Unauthorized"]
    K["Return 403<br/>Forbidden"]

    A --> B
    B -->|No| J
    B -->|Yes| C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H -->|Valid| I
    H -->|Expired| J
    H -->|Invalid| K

    style A fill:#bbdefb
    style I fill:#a5d6a7
    style J fill:#ffcdd2
    style K fill:#ffcdd2
```

---

## 11. Real-time Messaging Architecture

```mermaid
graph TB
    subgraph Client1["Client A Browser"]
        UI1["Vue.js UI"]
        SC1["Socket Client"]
    end

    subgraph Server["LegalConnect Server"]
        API["REST API"]
        Socket["Socket.io Server"]
        DB["Message DB"]
    end

    subgraph Client2["Client B Browser"]
        UI2["Vue.js UI"]
        SC2["Socket Client"]
    end

    UI1 -->|Type Message| SC1
    SC1 -->|WebSocket| Socket
    Socket -->|Store Message| DB
    Socket -->|Emit Event| SC2
    SC2 -->|Update UI| UI2

    UI2 -->|Type Message| SC2
    SC2 -->|WebSocket| Socket
    Socket -->|Store Message| DB
    Socket -->|Emit Event| SC1
    SC1 -->|Update UI| UI1

    API -->|Query History| DB
    Socket -->|Get History| DB

    style Client1 fill:#e3f2fd
    style Client2 fill:#e3f2fd
    style Server fill:#f3e5f5
```

---

## 12. Payment Processing Flow

```mermaid
graph LR
    A["User Initiates<br/>Payment"]
    B["Validate<br/>Amount"]
    C["Send to<br/>Stripe"]
    D{Payment<br/>Successful?}
    E["Update<br/>DB Status"]
    F["Send<br/>Confirmation"]
    G["Return Error<br/>Message"]
    H["Send Receipt<br/>Email"]

    A --> B
    B --> C
    C --> D
    D -->|Yes| E
    D -->|No| G
    E --> F
    F --> H

    style A fill:#bbdefb
    style F fill:#a5d6a7
    style G fill:#ffcdd2
    style H fill:#c8e6c9
```

---

## 13. User Registration Flow

```mermaid
graph TD
    A["User Visits<br/>Registration"]
    B["Enter Details:<br/>Email, Password,<br/>Name, Phone"]
    C["Submit Form"]
    D{Email<br/>Unique?}
    E["Send OTP<br/>via Email"]
    F["User Enters<br/>OTP"]
    G{OTP<br/>Valid?}
    H["Mark Email<br/>as Verified"]
    I["Account<br/>Created"]
    J["Redirect to<br/>Dashboard"]
    K["Email Already<br/>Exists Error"]
    L["OTP Expired<br/>Resend Option"]

    A --> B
    B --> C
    C --> D
    D -->|No| K
    D -->|Yes| E
    E --> F
    F --> G
    G -->|Invalid| L
    G -->|Valid| H
    H --> I
    I --> J

    style A fill:#e3f2fd
    style J fill:#a5d6a7
    style K fill:#ffcdd2
    style L fill:#ffe0b2
```

---

## 14. System Architecture Overview

```mermaid
graph TB
    subgraph Frontend["🎨 FRONTEND"]
        Vue["Vue.js 3"]
        Vite["Vite"]
        TailwindCSS["Tailwind CSS"]
    end

    subgraph Backend["⚙️ BACKEND"]
        Laravel["Laravel 11"]
        RestAPI["REST API"]
        Auth["Auth (JWT)"]
        Models["Models/Services"]
    end

    subgraph Database["🗄️ DATA LAYER"]
        MySQL["MySQL 8.0+"]
        Redis["Redis Cache"]
    end

    subgraph External["🔗 EXTERNAL"]
        Stripe["Stripe Payments"]
        Email["Email Service"]
        Storage["AWS S3"]
    end

    Vue --> Vite
    Vue --> TailwindCSS
    Vue -->|HTTP/REST| RestAPI
    Vite -->|Build| RestAPI

    RestAPI --> Auth
    RestAPI --> Models
    Models --> MySQL
    Models --> Redis

    RestAPI -->|API Calls| Stripe
    Models -->|Send| Email
    Models -->|Upload/Download| Storage

    style Frontend fill:#e8f5e9
    style Backend fill:#fff3e0
    style Database fill:#f3e5f5
    style External fill:#ffe0b2
```

---

## 15. Lawyer Availability Management

```mermaid
graph TB
    A["Lawyer Logs In"]
    B["Open Availability<br/>Settings"]
    C["Select Week Days"]
    D["Set Time Slots<br/>per Day"]
    E["Mark Vacation<br/>Periods"]
    F["Save Availability"]
    G["Display Available<br/>Slots to Clients"]
    H["Update Slots<br/>as Bookings Come"]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H

    style A fill:#bbdefb
    style F fill:#a5d6a7
    style G fill:#c8e6c9
```

---

You can copy these Mermaid diagrams directly into:
- Mermaid Live Editor: https://mermaid.live
- GitHub Markdown files
- VS Code with Mermaid extension
- Confluence, Notion, or other documentation platforms

All diagrams are production-ready and can be customized with colors and styling as needed.
