import React, { useState, useEffect, useCallback } from "react";

// ───────────────────────────────────────────────
// VIBE DECODER — Vanilla Logic (Zero-Cost / No API)
// ───────────────────────────────────────────────

interface DecodedResult {
  plainEnglish: string;
  analogy: string;
  jargon: Record<string, string>;
}

interface VibeEntry {
  plainEnglish: string;
  analogy: string;
  jargon: Record<string, string>;
}

const vibeLibrary: Record<string, VibeEntry> = {
  "We're decomposing the monolith into microservices.": {
    plainEnglish: "We're breaking our one big application into small, independent pieces that each handle a specific job, so changing one part doesn't accidentally break everything else.",
    analogy: "Like splitting a single giant food court that sells everything into separate food trucks – each truck has its own kitchen, menu, and can be updated without shutting down the others.",
    jargon: {
      "Decomposing": "Breaking a large system into smaller, more manageable parts.",
      "Monolith": "A single application where all features are bundled together, hard to scale and update independently.",
      "Microservices": "Independent, self-contained services that each own a specific business capability and communicate over a network."
    }
  },
  "We need to implement an API gateway.": {
    plainEnglish: "We're setting up a single front door for all our backend services, so outside requests go to one place and get routed to the right service securely.",
    analogy: "Like a hotel front desk that handles all guest requests – room service, maintenance, wake-up calls – and directs them to the right department without the guest needing to know who does what.",
    jargon: {
      "API": "Application Programming Interface – the menu of actions one piece of software can request from another.",
      "Gateway": "A single entry point that manages, routes, and often secures all incoming API calls."
    }
  },
  "Let's use webhooks instead of polling.": {
    plainEnglish: "Instead of constantly checking if something new happened, we'll have the other system automatically send us a message when an event occurs – it's more efficient.",
    analogy: "Rather than calling the pizza place every 5 minutes to ask if your order is ready, you just give them your number and they text you when it's done.",
    jargon: {
      "Webhooks": "User-defined HTTP callbacks triggered by an event, where the source system POSTs data to a specified URL.",
      "Polling": "Repeatedly checking a server for new data at set intervals, like hitting refresh over and over."
    }
  },
  "The REST endpoint returns a 201 on success.": {
    plainEnglish: "When someone successfully creates something through that address, the server responds with a specific code that means 'Created – it worked'.",
    analogy: "Like a cash register that prints 'Transaction Complete' with a receipt number, confirming the sale went through.",
    jargon: {
      "REST": "A style of designing networked applications using standard HTTP methods (GET, POST, PUT, DELETE).",
      "Endpoint": "A specific URL where an API can be accessed, like a doorbell to a particular service.",
      "201": "HTTP status code meaning 'Created' – the request succeeded and a new resource was made."
    }
  },
  "We're adopting event-driven architecture.": {
    plainEnglish: "Our system will react to things that happen – like orders placed or payments received – by triggering other processes automatically, rather than having everything tightly connected.",
    analogy: "Like a restaurant kitchen where the order bell rings, the chef starts cooking, and the waiter gets notified, all without anyone yelling across the room.",
    jargon: {
      "Event-driven": "A design where components communicate by producing and consuming events (facts that something happened).",
      "Architecture": "The overall structure and design of a system, guiding how its parts fit together."
    }
  },
  "Add an index on the user_id column.": {
    plainEnglish: "Create a lookup table that makes searching by user ID lightning fast, at the cost of slightly slower writes and extra storage.",
    analogy: "Like adding a glossary at the end of a textbook – finding a keyword is instant instead of scanning every page, but the book gets a bit thicker.",
    jargon: {
      "Index": "A data structure that improves query speed at the expense of additional storage and write overhead, similar to a book's index.",
      "Column": "A vertical field in a database table, such as 'user_id' or 'email'."
    }
  },
  "We need to shard the database.": {
    plainEnglish: "We'll split our huge dataset across multiple separate servers so no single machine gets overwhelmed, each holding a chunk of the data based on some rule like user location.",
    analogy: "Instead of one gigantic filing cabinet for all customer records, you have a separate cabinet for customers A-M in one room and N-Z in another, each managed independently.",
    jargon: {
      "Shard": "A horizontal partition of a database, where rows are distributed across different servers.",
      "Database": "Organized collection of data, typically managed by a DBMS (Database Management System)."
    }
  },
  "Run the migration to add a new column.": {
    plainEnglish: "Execute the script that updates the database structure to include a new piece of information we want to store, without losing existing data.",
    analogy: "Like adding an extra checkbox field to every existing paper form, then refilling the archive – the old info stays, but now there's a spot for new details.",
    jargon: {
      "Migration": "A version-controlled change to a database schema, allowing incremental updates and rollbacks.",
      "Schema": "The blueprint of how data is organized in a database – tables, columns, relationships."
    }
  },
  "We guarantee ACID transactions.": {
    plainEnglish: "Our database ensures that any complex operation (like transferring money) either fully completes or completely fails, never leaving things half-done, and once it's saved it stays saved.",
    analogy: "Like a reliable bank transfer: the money absolutely moves from one account to another, the bank tracks it atomically, and your balance never shows an inconsistent state even if the power goes out mid-transfer.",
    jargon: {
      "ACID": "Atomicity, Consistency, Isolation, Durability – a set of properties guaranteeing reliable database transactions.",
      "Atomicity": "A transaction is all-or-nothing; if any part fails, the whole thing is rolled back.",
      "Consistency": "Data must be valid according to all defined rules before and after the transaction.",
      "Isolation": "Concurrent transactions won't interfere with each other, as if they ran one at a time.",
      "Durability": "Once committed, a transaction survives system crashes."
    }
  },
  "Let's use a NoSQL document store for this.": {
    plainEnglish: "For this flexible, rapidly changing data, we'll use a database that stores whole documents (like JSON) instead of rigid rows and columns, making it easier to evolve.",
    analogy: "Rather than filling out strict paper forms with fixed fields, we're just dropping whole folders of whatever info we have into a big drawer, and we can search by tags later.",
    jargon: {
      "NoSQL": "A category of databases that don't rely on the traditional table/row relational model, designed for scale and flexibility.",
      "Document store": "A type of NoSQL database that stores semi-structured data as documents (often JSON), allowing varying fields per record."
    }
  },
  "The CI/CD pipeline broke on the build step.": {
    plainEnglish: "Our automated assembly line that tests and deploys code automatically stopped working at the step where it compiles the code; likely a recent change caused an error.",
    analogy: "Like a car factory assembly line where robots check and package the cars – it stopped because a part didn't fit during the engine build station.",
    jargon: {
      "CI/CD": "Continuous Integration / Continuous Delivery – automating code integration, testing, and deployment.",
      "Pipeline": "A series of automated steps (build, test, deploy) code goes through from commit to production.",
      "Build step": "The phase where source code is compiled, dependencies installed, and artifacts created."
    }
  },
  "We containerized the app with Docker.": {
    plainEnglish: "We've packaged the application and all its dependencies into a lightweight, portable box that runs the same way on any computer or server.",
    analogy: "Like a standardized shipping container that holds everything the store needs – fridge, shelves, electricity – so you can move it from port to port and it's ready to open for business immediately.",
    jargon: {
      "Containerized": "Packaging software with its entire runtime environment so it runs consistently across different computing environments.",
      "Docker": "A platform for developing, shipping, and running applications inside isolated containers."
    }
  },
  "We orchestrate containers with Kubernetes.": {
    plainEnglish: "We use a system that automatically manages all our application containers – starting them, restarting failures, scaling up when busy – so we don't manually juggle them.",
    analogy: "Like an airport control tower that directs where planes (containers) go, when they land/take off, and reroutes them if a runway is closed.",
    jargon: {
      "Orchestrate": "Automate the deployment, scaling, and management of containerized applications.",
      "Kubernetes": "An open-source container orchestration platform originally designed by Google, often abbreviated K8s."
    }
  },
  "It runs on a serverless function.": {
    plainEnglish: "We write a small piece of code that only runs when triggered by an event, and the cloud provider handles all the servers; we just pay for execution time.",
    analogy: "Like hiring a caterer only when you have a party – you don't own the kitchen, you just pay per event, and they handle all the cooking and cleaning.",
    jargon: {
      "Serverless": "A cloud execution model where the provider dynamically manages server allocation and scaling, billing based on actual resource consumption.",
      "Function": "A small, single-purpose piece of code that runs in response to events (e.g., an HTTP request or file upload)."
    }
  },
  "Trigger a Lambda on image upload.": {
    plainEnglish: "Whenever someone uploads a picture, automatically run a specific piece of code (like resizing) in the cloud, without managing any servers.",
    analogy: "Like attaching a note to a conveyor belt: 'When a package arrives, stamp it and put it on the next belt' – the worker (cloud) appears only when needed.",
    jargon: {
      "Lambda": "AWS Lambda, a serverless compute service that runs code in response to triggers.",
      "Trigger": "An event that causes a function or process to start executing."
    }
  },
  "We're facing a hydration mismatch in the React app.": {
    plainEnglish: "The HTML sent from the server doesn't match what the browser's JavaScript built, causing the page to flash or break – usually because of something like timestamps that differ.",
    analogy: "Like a color-by-numbers canvas where the printed numbers (server HTML) don't match the paint-by-numbers guide (client JS), so the picture gets repainted erratically.",
    jargon: {
      "Hydration": "The process where client-side JavaScript attaches event handlers and state to server-rendered HTML, making it interactive.",
      "Mismatch": "A difference between the pre-rendered HTML and the initial client-side render, which React warns about."
    }
  },
  "We're using Server-Side Rendering for SEO.": {
    plainEnglish: "We generate the full web page on the server first, so search engines can read the content easily, then the browser takes over to make it interactive.",
    analogy: "Like a restaurant that pre-plates meals in the kitchen before the waitstaff delivers them, so you see a complete dish immediately, not an empty plate with ingredients arriving separately.",
    jargon: {
      "Server-Side Rendering (SSR)": "Rendering a page on the server instead of the browser, sending fully formed HTML to the client.",
      "SEO": "Search Engine Optimization – making a site easily discoverable and readable by search engines."
    }
  },
  "This page is Client-Side Rendered.": {
    plainEnglish: "The browser downloads a bare-bones page and then JavaScript builds the entire interface in your browser, which can make initial loading slower but interactions smooth.",
    analogy: "Like ordering a furniture kit: you get a box of parts and an instruction manual, then you assemble it at home instead of having a pre-built piece delivered.",
    jargon: {
      "Client-Side Rendering (CSR)": "Rendering the user interface entirely in the browser using JavaScript, sending minimal HTML initially.",
      "JavaScript": "The programming language of the web, enabling dynamic content on pages."
    }
  },
  "Tree-shaking eliminated dead code.": {
    plainEnglish: "Our build tool automatically removed pieces of code we imported but never actually used, shrinking the final file size.",
    analogy: "Like a gardener shaking a tree so dead leaves fall off – you only ship the healthy, needed parts, making the bundle lighter.",
    jargon: {
      "Tree-shaking": "A build optimization that eliminates unused exports from JavaScript modules, based on static analysis of imports.",
      "Dead code": "Code that is never executed or referenced in the application."
    }
  },
  "The bundler split our chunks for lazy loading.": {
    plainEnglish: "The build tool broke our app into smaller pieces that only load when a user actually needs that section, speeding up the initial page load.",
    analogy: "Like a moving service that delivers boxes room-by-room instead of unloading the entire truck at once – you start setting up the living room while the rest stays on the truck until you're ready.",
    jargon: {
      "Bundler": "A tool (e.g., Webpack, Vite) that combines multiple JavaScript files and assets into a few optimized bundles.",
      "Chunks": "Smaller output bundles created by code splitting, loaded on demand.",
      "Lazy loading": "Delaying the loading of non-critical resources until they are needed."
    }
  },
  "Middleware handles authentication and logging.": {
    plainEnglish: "We have a middle layer that checks every incoming request – verifying who you are, logging what you're doing – before it even reaches the main application logic.",
    analogy: "Like a security guard at an office building who checks IDs, notes visitors, and only lets people through to the actual offices after they pass inspection.",
    jargon: {
      "Middleware": "Software that sits between the operating system/network and the application, providing common services like logging, authentication, and request parsing.",
      "Authentication": "Verifying the identity of a user or system (e.g., checking a password or token)."
    }
  },
  "We need to implement role-based authorization.": {
    plainEnglish: "We'll set up rules so that different types of users (admin, editor, viewer) can only do certain things – like an admin can delete accounts but a regular user can't.",
    analogy: "Like an employee badge at a company: a badge with 'Manager' opens the supply closet, but a 'Staff' badge only opens the break room. The system checks the role before granting access.",
    jargon: {
      "Authorization": "Determining what permissions an authenticated user has – what they are allowed to do.",
      "Role-based": "Access control based on roles assigned to users, rather than individual permissions."
    }
  },
  "Use a Redis cache to reduce database load.": {
    plainEnglish: "Store frequently requested data in a super-fast, temporary memory store so that repeated queries don't hammer the main database.",
    analogy: "Like a bartender keeping common bottles on the speed rail instead of running to the cellar every time someone orders a gin and tonic.",
    jargon: {
      "Cache": "A temporary storage layer that holds copies of data for faster retrieval.",
      "Redis": "An open-source, in-memory data structure store often used as a cache, broker, or database."
    }
  },
  "We're using a message queue for background jobs.": {
    plainEnglish: "When there's a heavy task like sending thousands of emails, we drop the request into a to-do list that workers pick up and process one by one, so the website stays fast.",
    analogy: "Like a restaurant’s order ticket rail: the waiter hangs the order, and the kitchen staff pulls tickets when they're ready, without the waiter waiting by the stove.",
    jargon: {
      "Message queue": "A communication mechanism where messages are stored temporarily until a receiver processes them, enabling asynchronous processing.",
      "Background jobs": "Tasks that run outside the main flow of a user request, often handled by separate worker processes."
    }
  },
  "We're fine-tuning GPT on our support transcripts.": {
    plainEnglish: "We're taking a pre-trained general language AI and giving it extra training on our own customer service chats, so it learns our tone, product names, and typical issues.",
    analogy: "Like hiring an experienced chef and then spending a week teaching them your restaurant's specific recipes and plating style, instead of hiring someone from scratch.",
    jargon: {
      "Fine-tuning": "Taking a pre-trained machine learning model and training it further on a specific, often smaller dataset to specialize it.",
      "GPT": "Generative Pre-trained Transformer, a type of large language model known for text generation."
    }
  },
  "We'll generate embeddings for search.": {
    plainEnglish: "We'll convert text (like product descriptions) into lists of numbers that represent meaning, so that searching 'comfy sofa' can find 'cozy couch' even if the words differ.",
    analogy: "Like giving every book in a library a set of coordinates based on its topics and style, so 'things near this point' are conceptually similar, not just matching keywords.",
    jargon: {
      "Embeddings": "Numerical vector representations of data (words, sentences, images) that capture semantic meaning and relationships.",
      "Search": "In this context, semantic search using vector similarity instead of exact keyword matching."
    }
  },
  "The prompt engineering improved the LLM output.": {
    plainEnglish: "By carefully rewriting the instructions we give the AI, we got much better and more accurate responses without changing the AI itself.",
    analogy: "Like refining the briefing you give a freelance designer – the same person, but a clearer brief gets you a logo that works the first time.",
    jargon: {
      "Prompt engineering": "The practice of designing effective inputs (prompts) to elicit desired outputs from a language model.",
      "LLM": "Large Language Model – an AI trained on vast text corpora to predict and generate human-like text."
    }
  },
  "We're using too many tokens per request.": {
    plainEnglish: "Each AI call is feeding in (and potentially generating) too many pieces of text, which costs more money and slows things down – we need to be more concise.",
    analogy: "Like paying a consultant by the word for both the briefing document you send and their reply; a rambling memo leads to a huge bill.",
    jargon: {
      "Tokens": "Pieces of text (words, subwords, characters) that language models read and generate; pricing is often per token.",
      "Request": "A single call to an AI model's API, which processes input tokens and returns output tokens."
    }
  },
  "Inference latency is too high for real-time.": {
    plainEnglish: "The AI takes too long to generate a response after receiving a question, making it unsuitable for live interactions like chatbots.",
    analogy: "If a chef takes 10 minutes to answer 'What's the soup of the day?', it ruins the flow of ordering; they need to respond instantly.",
    jargon: {
      "Inference": "The process of using a trained machine learning model to make predictions or generate outputs on new data.",
      "Latency": "The time delay between a request and the start of the response."
    }
  },
  "We've got a story that's blocked by an external dependency.": {
    plainEnglish: "A feature we planned for this sprint can't be completed yet because we're waiting on something from another team or a third-party service.",
    analogy: "You can't finish painting the living room because the drywall repair person hasn't patched the hole yet, and they aren't available until next week.",
    jargon: {
      "Story": "A user story – a short, plain-language description of a feature from the perspective of an end user.",
      "Blocked": "When progress on a work item cannot continue due to an obstacle.",
      "Dependency": "Something external that must be completed or available before a task can finish."
    }
  },
  "Let's break this epic into smaller stories.": {
    plainEnglish: "That big feature request is too large to finish in one sprint, so let's split it into smaller, customer-valuable chunks we can deliver incrementally.",
    analogy: "Instead of tackling 'renovate the entire house' as one project, you make a list: repaint kitchen, replace bathroom tiles, install new lights – each deliverable on its own.",
    jargon: {
      "Epic": "A large body of work that can be broken down into multiple smaller user stories, often spanning several sprints.",
      "Sprint": "A time-boxed period (usually 1–4 weeks) in which a set of work must be completed and made ready for review."
    }
  },
  "We're allocating 20% of sprint capacity to technical debt.": {
    plainEnglish: "Each sprint, we set aside a fifth of our developer time to clean up messy code, update old libraries, and improve the system's health rather than just building new features.",
    analogy: "Like a restaurant that closes on Monday afternoons not for new menu development, but to deep-clean the kitchen and fix broken equipment so service stays smooth.",
    jargon: {
      "Sprint capacity": "The total amount of work a team can realistically complete in a sprint, measured in story points or hours.",
      "Technical debt": "The accumulated cost of shortcuts and suboptimal code that makes future changes harder and riskier, like financial debt that accrues interest."
    }
  },
  "The retrospective highlighted a lack of stakeholder alignment.": {
    plainEnglish: "In our post-sprint meeting, we realized the team and the business folks weren't on the same page about priorities, leading to wasted effort.",
    analogy: "A pit crew thinks the car needs a tire change, but the team owner wanted an engine check – after the race, they discuss why signals got crossed.",
    jargon: {
      "Retrospective": "A meeting held after a sprint to reflect on what went well, what didn't, and how to improve.",
      "Stakeholder alignment": "Ensuring all parties with a vested interest in the project share the same understanding of goals, scope, and priorities."
    }
  },
  "We're implementing OAuth 2.0 for social login.": {
    plainEnglish: "Instead of creating yet another username/password, users can sign in with their Google or Facebook account, and we use a standard protocol that keeps things secure.",
    analogy: "Like using your driver's license (issued by a trusted authority) to prove your age at a bar; the bar trusts the ID, they don't need to call your parents.",
    jargon: {
      "OAuth 2.0": "An authorization framework that allows a user to grant a third-party application limited access to their resources without sharing credentials.",
      "Social login": "A single sign-on feature using existing accounts from social networks (Google, Facebook) to authenticate."
    }
  },
  "We pass the JWT in the Authorization header.": {
    plainEnglish: "After logging in, the server gives the browser a cryptographically signed token containing user info; the browser sends it with every request so the server knows who you are.",
    analogy: "Like a wristband at an all-inclusive resort: once you show your ID at check-in, you get a wristband that proves you've paid; every bar and restaurant just glances at the band, no need to ask for ID again.",
    jargon: {
      "JWT": "JSON Web Token – a compact, URL-safe token format that encodes claims (user ID, roles) and can be verified via signature.",
      "Authorization header": "An HTTP header field used to send credentials (like a token) to authenticate a request."
    }
  },
  "We hash passwords, we never store them in plaintext.": {
    plainEnglish: "We run every password through a one-way scrambling function so that the actual password is never saved in our database; even if we're hacked, the real passwords stay hidden.",
    analogy: "Like keeping a safe with a fingerprint reader – you store fingerprints, not actual keys. Even if someone breaks in, they can't use a print to make a new finger, and you can't reverse a print back to the original key shape.",
    jargon: {
      "Hash": "A one-way cryptographic function that maps data of arbitrary size to a fixed-size string, designed to be irreversible.",
      "Plaintext": "Unencrypted data, in this context the original password that should never be stored."
    }
  },
  "Run a penetration test before launch.": {
    plainEnglish: "Hire ethical hackers to deliberately attack our system and find security holes before real criminals do, so we can fix them.",
    analogy: "Hiring a locksmith to try to break into your house while you watch, then reinforcing the weak points they exploited.",
    jargon: {
      "Penetration test": "A simulated cyber attack against a system to evaluate its security weaknesses.",
      "Launch": "The go-live date when a product or feature becomes available to real users."
    }
  },
  "We use bcrypt with a salt for password hashing.": {
    plainEnglish: "When scrambling passwords, we add a unique random string (salt) to each one before hashing, so even identical passwords look completely different and rainbow table attacks won't work.",
    analogy: "Like giving every family member a different secret spice mix to add to their scrambled eggs – even if they all use the same eggs, the final dish tastes unique and can't be reproduced by a generic recipe book.",
    jargon: {
      "bcrypt": "A password-hashing function designed to be slow and computationally expensive, thwarting brute-force attacks.",
      "Salt": "Random data added to a password before hashing to ensure that the same password yields different hashes."
    }
  },
  "The ETL pipeline extracts from the transactional DB and loads into the warehouse.": {
    plainEnglish: "We have an automated process that pulls raw operational data, cleans and reshapes it, and then puts it into a separate analysis database where business folks can run reports without slowing down the main app.",
    analogy: "Every night, a janitor collects all the day's order slips from the busy restaurant, sorts them by category, and files them in the back office for the accountant, so the kitchen doesn't get cluttered.",
    jargon: {
      "ETL": "Extract, Transform, Load – a process that copies data from source systems, modifies it, and writes it to a destination.",
      "Transactional DB": "A database optimized for handling day-to-day operations (OLTP), like recording sales.",
      "Warehouse": "A database designed for analytical queries and reporting (OLAP), storing historical and aggregated data."
    }
  },
  "We built a data lake on S3 with Parquet files.": {
    plainEnglish: "Instead of a rigid database, we dump all our raw, unprocessed data into cheap cloud storage in a compressed columnar format, then we can analyze it later with various tools.",
    analogy: "A massive reservoir that collects rainwater, creek flows, and melted snow all together; later, you can filter it for drinking, irrigate crops, or analyze the mineral content – it's not pre-structured.",
    jargon: {
      "Data lake": "A storage repository that holds vast amounts of raw data in its native format until needed.",
      "S3": "Amazon Simple Storage Service – scalable cloud object storage.",
      "Parquet": "An open-source columnar storage file format optimized for big data processing."
    }
  },
  "We need to backfill the missing data from last quarter.": {
    plainEnglish: "Because a bug caused a gap in our records, we have to rerun the historical processing to insert the missing entries for that period.",
    analogy: "Noticing the bank missed recording deposits for March, an accountant manually goes through March's deposit slips and enters them all now.",
    jargon: {
      "Backfill": "The process of populating missing historical data after a pipeline fix or schema change.",
      "Quarter": "A three-month financial period (Q1, Q2, etc.) used for reporting."
    }
  },
  "Let's leverage synergy across the design and engineering teams.": {
    plainEnglish: "We should have designers and developers work more closely together so that their combined output is better than if they worked separately.",
    analogy: "Like a chef and a farmer planning a menu together: the farmer knows what's fresh, the chef knows what dishes sell well; together they create a menu that's both delicious and cost-effective.",
    jargon: {
      "Leverage": "Use something to maximum advantage.",
      "Synergy": "The idea that combined effort produces a result greater than the sum of individual efforts."
    }
  },
  "We're circling back to align on strategic pillars.": {
    plainEnglish: "We need to revisit this topic later to make sure our plans match the company's main priorities.",
    analogy: "Before a road trip, you check the map again to ensure the route still aligns with the destination everyone agreed on, not just where the GPS is currently pointing.",
    jargon: {
      "Circling back": "Revisiting a discussion or issue at a later time.",
      "Strategic pillars": "Core focus areas or high-level objectives that guide business decisions."
    }
  },
  "We need to socialize the proposal to get buy-in.": {
    plainEnglish: "Before making a final decision, we must share the idea informally with key people to gather feedback and get their approval.",
    analogy: "Before announcing a new family vacation spot, you casually mention it to your spouse and kids at dinner to see if anyone objects, rather than booking it unilaterally.",
    jargon: {
      "Socialize": "To share and discuss an idea broadly within an organization to build support.",
      "Buy-in": "Agreement, commitment, or acceptance from stakeholders."
    }
  },
  "It's a paradigm shift in how we think about data.": {
    plainEnglish: "This fundamentally changes the way we approach our data problems – not just a small tool upgrade, but a new mindset.",
    analogy: "When cars replaced horses, it wasn't a faster horse – it was a completely different concept of transportation, requiring roads, gas stations, and a new set of skills.",
    jargon: {
      "Paradigm shift": "A fundamental change in the basic concepts and experimental practices of a discipline.",
      "Data": "Facts and statistics collected for reference or analysis."
    }
  },
  "We're moving to a headless CMS architecture.": {
    plainEnglish: "We're separating the place where content is written (the backend) from how it's displayed (the frontend), so we can use the same content on a website, app, and smart watch.",
    analogy: "A news agency that produces articles and then sends them to newspapers, TV stations, and radio – the content is the same, but the presentation adapts to the medium.",
    jargon: {
      "Headless": "Decoupled architecture where the frontend (the 'head') is removed, and content is served via API to any display layer.",
      "CMS": "Content Management System – software for creating and managing digital content."
    }
  },
  "We're using a feature flag to rollout dark mode to 10% of users.": {
    plainEnglish: "We've wrapped the dark mode feature in a toggle that we can turn on remotely for a small group of users first, instead of releasing it to everyone at once.",
    analogy: "Like restaurant that tests a new menu item by offering it as a free sample to a few tables before putting it on the main menu – if it's a hit, they expand.",
    jargon: {
      "Feature flag": "A conditional statement in code that enables or disables a feature without redeploying, often controlled by configuration.",
      "Rollout": "The process of gradually delivering a new release to a subset of users."
    }
  },
  "Add a circuit breaker to the payment service call.": {
    plainEnglish: "If the payment system starts failing, we'll stop calling it for a while and fall back gracefully, instead of bombarding it with requests and making things worse.",
    analogy: "When a fuse blows, it cuts off electricity to prevent a fire. Once the issue is fixed, you reset the fuse and everything works again.",
    jargon: {
      "Circuit breaker": "A design pattern that detects failures and prevents cascading failures across services by temporarily blocking requests.",
      "Payment service": "An external or internal service that handles financial transactions."
    }
  },
  "We implemented idempotency keys for the order creation endpoint.": {
    plainEnglish: "We gave each order request a unique identifier so that if the network hiccups and the same request is sent twice, we only create one order, not a double charge.",
    analogy: "Like putting a unique tracking number on a mail-in rebate form – if you accidentally mail two copies, the system sees the same number and ignores the duplicate.",
    jargon: {
      "Idempotency keys": "Unique tokens sent by a client that allow the server to recognize and discard duplicate requests, ensuring an operation is performed only once.",
      "Endpoint": "The specific URL where an API operation is accessed."
    }
  },
  "We're server-side rendering with React Server Components.": {
    plainEnglish: "We generate parts of the React interface on the server and send only the ready-made HTML, reducing the amount of JavaScript the browser has to download and run.",
    analogy: "Like a meal delivery service that sends pre-cooked dishes that just need reheating, instead of raw ingredients with a recipe – you get a full meal faster with less work.",
    jargon: {
      "Server Components": "A React feature allowing components to render exclusively on the server, reducing client-side JavaScript bundle size.",
      "SSR": "Server-Side Rendering, delivering pre-rendered HTML from the server."
    }
  },
  "Use optimistic updates for the like button.": {
    plainEnglish: "When you tap the like button, the UI immediately shows the increased count before the server confirms it, making it feel instant; if the server rejects it, we revert.",
    analogy: "A waiter nods and writes down your drink order, showing you they've got it, even though the bartender hasn't poured it yet – you see the assumed progress.",
    jargon: {
      "Optimistic updates": "Updating the user interface immediately assuming a network request will succeed, then rolling back if it fails.",
      "Like button": "A common UI element for expressing approval on social content."
    }
  },
  "The endpoint is paginated using cursor-based pagination.": {
    plainEnglish: "When returning a long list, the API gives you a pointer to the next batch of results instead of page numbers, preventing inconsistencies when data is added between requests.",
    analogy: "Instead of 'go to page 3 of the library catalog', the librarian hands you a bookmark that says 'continue from here', so you never skip or duplicate books even if new books are inserted.",
    jargon: {
      "Paginated": "Breaking a large dataset into smaller sequential chunks for performance.",
      "Cursor-based pagination": "Using a unique reference (e.g., an ID or timestamp) to fetch the next set, avoiding issues with offset-based pagination when data changes."
    }
  },
  "We have a pub/sub system for real‑time notifications.": {
    plainEnglish: "One part of the system announces an event (like 'new message'), and many different listeners (browser tabs, mobile push, email) can subscribe to that event and react in their own way.",
    analogy: "A radio station broadcasts a song; anyone tuned in can hear it, but the station doesn't need to know who's listening or how many.",
    jargon: {
      "Pub/sub": "Publish/subscribe – a messaging pattern where senders (publishers) emit messages without knowing receivers (subscribers) directly.",
      "Real‑time": "Data is processed and delivered immediately after being generated."
    }
  },
  "We're using a monorepo with Yarn workspaces.": {
    plainEnglish: "All our project code (frontend, backend, shared libraries) lives in one big repository, making it easier to share code and coordinate changes across teams.",
    analogy: "Like keeping all the equipment for a film production – cameras, lights, props – in one warehouse; the crew can grab what they need without calling a separate rental house.",
    jargon: {
      "Monorepo": "A single version-controlled repository that contains multiple distinct projects.",
      "Yarn workspaces": "A feature of the Yarn package manager that helps manage dependencies across multiple packages in a monorepo."
    }
  },
  "We're implementing blue‑green deployments.": {
    plainEnglish: "We have two identical production environments; we deploy to the inactive one, test it, and then switch all traffic to it instantly, with zero downtime and easy rollback.",
    analogy: "A theater with two identical stages: while a play is live on stage A, the crew sets up the next production on stage B; at intermission, they rotate the entire audience seat to face stage B. No gaps, no confusion.",
    jargon: {
      "Blue‑green deployments": "A release technique with two identical environments (blue and green), where traffic switches from one to the other after a new version is verified.",
      "Downtime": "A period when a system is unavailable."
    }
  },
  "We need to refactor this God class.": {
    plainEnglish: "This one piece of code does way too much – it knows about database, emails, and business rules – so we'll split it into smaller, focused pieces that are easier to understand and change.",
    analogy: "A restaurant where the head chef also takes orders, cleans tables, and orders supplies. You'd hire waitstaff, a dishwasher, and a purchasing manager to keep the chef cooking.",
    jargon: {
      "God class": "A class that has grown too large and has too many responsibilities, violating the Single Responsibility Principle.",
      "Refactor": "Restructure existing code to improve its internal design without changing external behavior."
    }
  },
  "The build broke because of a dependency hell.": {
    plainEnglish: "Our libraries depend on other libraries that require specific versions, and they conflict, causing the build to fail until we straighten out the versions.",
    analogy: "Trying to cook a meal where one recipe asks for 'salt v1.2' and another demands 'salt v2.0', and they can't be in the same kitchen.",
    jargon: {
      "Dependency hell": "A colloquial term for frustration caused by version conflicts in software dependencies.",
      "Build": "The process of compiling and packaging source code into an executable artifact."
    }
  },
  "We should use a load balancer to distribute traffic.": {
    plainEnglish: "Instead of one server handling all visitors, we put a traffic cop in front that sends each request to the least busy server, preventing overload and improving reliability.",
    analogy: "A supermarket with multiple checkout lanes and a manager directing customers to the shortest line.",
    jargon: {
      "Load balancer": "A device or software that distributes network traffic across multiple servers.",
      "Traffic": "The volume of requests coming into a system."
    }
  },
  "The database is read‑heavy, so we added read replicas.": {
    plainEnglish: "Most of our database work is fetching data, not writing it. So we created read-only copies that share the load, keeping the main server fast for writes.",
    analogy: "A library with one main checkout desk for borrowing books (writes), but multiple reading tables with duplicate copies of popular books for people to read on‑site without disturbing the checkout queue.",
    jargon: {
      "Read‑heavy": "A workload where read operations outnumber write operations significantly.",
      "Read replicas": "Copies of a database that handle read queries, offloading work from the primary instance."
    }
  },
  "We're using an event sourcing pattern for the ledger.": {
    plainEnglish: "Instead of just storing the current balance, we record every transaction as an immutable event, and the balance is derived by replaying all events from the beginning.",
    analogy: "Like a checkbook register: you don't just save a running total; you write down every deposit and withdrawal. If there's a dispute, you can reconstruct the entire history.",
    jargon: {
      "Event sourcing": "Storing the state of an application as a sequence of immutable events, rather than just the current state.",
      "Ledger": "A book or system for recording financial transactions."
    }
  },
  "This is a breaking change in the API contract.": {
    plainEnglish: "We changed the API in a way that will cause existing apps using it to fail, so we need to version it or coordinate updates carefully.",
    analogy: "The postal service changes mailbox slot size so old letters don't fit anymore – everyone must get a new mailbox or send smaller envelopes.",
    jargon: {
      "Breaking change": "A modification that is not backward‑compatible, requiring consumers to update their code.",
      "API contract": "The agreed‑upon specification of requests and responses that an API promises to support."
    }
  },
  "We need to hash user emails for GDPR compliance.": {
    plainEnglish: "To protect privacy under European law, we'll irreversibly scramble email addresses before storing them in analytics, so individuals can't be identified from that data.",
    analogy: "Instead of writing guests' full names in a public logbook, a hotel writes a unique, one‑way code based on the name – you can verify someone stayed, but you can't read the name from the code.",
    jargon: {
      "GDPR": "General Data Protection Regulation, an EU law on data protection and privacy.",
      "Hash": "A one‑way function that produces a fixed‑size string from input data."
    }
  },
  "We're using a columnar database for analytics.": {
    plainEnglish: "Our analysis database stores data column by column instead of row by row, which makes aggregating data (like summing sales) incredibly fast, though it's slower for single record lookups.",
    analogy: "If you want to calculate the average height in a classroom, it's faster to have a list of all heights rather than flipping through each student's full profile sheet that contains name, address, grades, etc.",
    jargon: {
      "Columnar database": "A database that stores data by columns rather than rows, optimized for analytical queries.",
      "Analytics": "Discovery, interpretation, and communication of meaningful patterns in data."
    }
  },
  "We're deprecating the v1 endpoint; migrate to v2.": {
    plainEnglish: "We're marking the old API as outdated and will remove it eventually. Please move to the new version as soon as possible to avoid disruption.",
    analogy: "An old ferry route is being shut down; there's a newer, faster bridge next to it. Signs say 'Ferry ends Nov 1 – use bridge'.",
    jargon: {
      "Deprecating": "Designating a feature or service as obsolete and scheduled for removal, while still functional temporarily.",
      "Endpoint": "A specific access point for an API."
    }
  },
  "Run a database VACUUM to reclaim space.": {
    plainEnglish: "We'll command the database to physically clean up and reuse empty space left behind by deleted or updated rows, improving performance and disk usage.",
    analogy: "Taking all your books off the shelf, dusting, pressing out the bookmark bulges, and reshelving them tightly so you fit more books and find things faster.",
    jargon: {
      "VACUUM": "A maintenance command (e.g., in PostgreSQL) that reclaims storage occupied by dead tuples and updates table statistics.",
      "Reclaim space": "Recover disk space that is no longer needed."
    }
  },
  "We use a polyfill for older browsers.": {
    plainEnglish: "We include a small piece of code that adds modern features (like promises or fetch) to older web browsers that don't natively support them, so the site works for everyone.",
    analogy: "If an old TV lacks an HDMI port, you use an adapter box that translates the signal, letting you play your new game console on it.",
    jargon: {
      "Polyfill": "A piece of code that provides modern functionality on older browsers that lack native support.",
      "Older browsers": "Outdated versions of web browsers that don't support the latest web standards."
    }
  },
  "We're using code splitting to improve first contentful paint.": {
    plainEnglish: "We split our JavaScript so the browser only loads the minimum needed to show the first screen quickly, then loads the rest in the background.",
    analogy: "A waiter first brings drinks and appetizers to the table immediately from the front cart, while the main course is still being prepared in the kitchen.",
    jargon: {
      "Code splitting": "Dividing a JavaScript bundle into smaller chunks that can be loaded on demand.",
      "First Contentful Paint": "A metric measuring the time it takes for the browser to render the first piece of DOM content."
    }
  },
  "We're using a virtual DOM diffing algorithm.": {
    plainEnglish: "React keeps a lightweight copy of the webpage's structure, compares it to the real one, and only updates the tiny parts that changed instead of redrawing the entire page.",
    analogy: "An architect overlays the original blueprint with a tracing paper, marks only what needs to be changed, and then hands the corrections to the construction crew – they don't rebuild the whole house.",
    jargon: {
      "Virtual DOM": "An in‑memory representation of the real DOM used by React to optimize updates.",
      "Diffing": "The process of comparing two versions of the virtual DOM to compute the minimal set of changes."
    }
  },
  "We set a TTL on the cache entries.": {
    plainEnglish: "We tell the cache how long to keep each piece of data before considering it stale and fetching a fresh copy, balancing freshness against speed.",
    analogy: "A cafeteria puts a 'best by' sticker on pre‑made sandwiches – after 2 hours, they toss them and make new ones so nobody gets stale food.",
    jargon: {
      "TTL": "Time to Live – the lifespan of data in a cache or network before it is discarded or refreshed.",
      "Cache entries": "Individual items stored in a cache."
    }
  },
  "We need to normalize the database schema to 3NF.": {
    plainEnglish: "We're restructuring the tables to eliminate duplicated data and ensure each piece of information lives in exactly one place, reducing update anomalies.",
    analogy: "Instead of writing a customer's address on every order (and risking typos), you store the address once in a customer record and reference it by ID.",
    jargon: {
      "Normalize": "The process of organizing database columns and tables to reduce redundancy and improve data integrity.",
      "3NF": "Third Normal Form – a level of database normalization that removes transitive dependencies."
    }
  },
  "We're using a bloom filter to reduce lookups.": {
    plainEnglish: "Before we do a full, expensive database search, we check a fast, memory‑efficient probabilistic structure that can tell us 'definitely not present' or 'maybe present', saving time.",
    analogy: "A bouncer at a club scans a list of banned customers using a quick‑check algorithm that says 'this person is not banned' – if it says 'maybe,' they do a full ID check.",
    jargon: {
      "Bloom filter": "A space‑efficient probabilistic data structure used to test whether an element is a member of a set, with no false negatives but possible false positives.",
      "Lookups": "Database queries to find a specific record."
    }
  },
  "We're using LLM‑based retrieval augmented generation.": {
    plainEnglish: "When the AI answers a question, it first searches a trusted knowledge base for the most relevant documents, then writes an answer based on those documents, reducing hallucinations.",
    analogy: "An open‑book exam where the student first finds the right textbook section, then crafts an answer using that source, instead of trying to recall everything from memory.",
    jargon: {
      "LLM": "Large Language Model.",
      "Retrieval augmented generation (RAG)": "A technique that combines information retrieval from a knowledge base with generative models to produce factually grounded responses."
    }
  },
  "We need to do prompt chaining for complex tasks.": {
    plainEnglish: "Instead of one giant instruction, we break the task into multiple steps, feeding the output of one AI call into the next, to handle complex reasoning more reliably.",
    analogy: "A chef prepares a complex dish: first they make the sauce, then they use that sauce in the braise. Separating steps prevents a messy, all‑at‑once disaster.",
    jargon: {
      "Prompt chaining": "Connecting multiple prompts in sequence, where the output of one becomes the input or context for the next.",
      "Complex tasks": "Problems that require multi‑step reasoning or actions."
    }
  },
  "We need to reduce the cold start latency of the Lambda.": {
    plainEnglish: "When our serverless function hasn't been used recently, it takes extra time to start up. We're trying to make that initial startup faster.",
    analogy: "A food truck that shuts down completely overnight takes a while to fire up the griddle and warm the engine for the first customer; you want to keep the pilot light on.",
    jargon: {
      "Cold start": "The latency incurred when a serverless function is invoked after a period of inactivity, as the infrastructure provisions a new instance.",
      "Lambda": "AWS Lambda function."
    }
  },
  "We're adopting infrastructure as code with Terraform.": {
    plainEnglish: "We define our servers, networks, and databases in configuration files, allowing us to version, replicate, and automate the setup instead of manually clicking in cloud consoles.",
    analogy: "Instead of building a house by hand with a hammer, you design it in CAD and a machine constructs it – the blueprint is the source of truth, reproducible and modifiable.",
    jargon: {
      "Infrastructure as code (IaC)": "Managing and provisioning computing infrastructure through machine‑readable definition files, not physical hardware configuration.",
      "Terraform": "An open‑source IaC tool by HashiCorp that defines resources in declarative config files."
    }
  },
  "We need to implement a service mesh for observability.": {
    plainEnglish: "We're adding a dedicated layer that sits between every microservice and the network, automatically handling secure communication, logging, and monitoring without changing app code.",
    analogy: "Like installing a central plumbing manifold that tracks water flow, pressure, and leaks for every fixture in a building, rather than checking each faucet individually.",
    jargon: {
      "Service mesh": "An infrastructure layer that controls service‑to‑service communication, providing features like discovery, load balancing, encryption, and observability.",
      "Observability": "The ability to understand a system's internal state from its external outputs (logs, metrics, traces)."
    }
  },
  "The QA found a regression in the checkout flow.": {
    plainEnglish: "The testing team discovered that something that used to work correctly in the purchase process is now broken, likely due to a recent code change.",
    analogy: "After fixing a squeaky brake, the mechanic realizes the headlights now flicker – a problem re‑appeared that was fine before.",
    jargon: {
      "QA": "Quality Assurance – systematic testing to ensure product quality.",
      "Regression": "A bug where a previously working feature breaks after a change.",
      "Checkout flow": "The sequence of steps a user follows to complete an online purchase."
    }
  },
  "We're using a canary release strategy.": {
    plainEnglish: "We roll out the new version to a tiny subset of users first, monitor for errors, and only if it's clean do we gradually increase to everyone.",
    analogy: "A coal miner sent a canary into the tunnel first; if the bird stopped singing, it wasn't safe. We send a new version to 1% of users; if it doesn't crash, it's safe for all.",
    jargon: {
      "Canary release": "A technique to reduce the risk of deploying new software by slowly rolling it out to a small fraction of users before a full launch.",
      "Strategy": "A plan of action designed to achieve a long‑term aim."
    }
  },
  "We need to implement a dead letter queue.": {
    plainEnglish: "When a message can't be processed after several tries, instead of blocking the whole queue, we move it to a separate holding area for later inspection.",
    analogy: "A malfunctioning package on a conveyor belt gets shunted to a side chute so the main line keeps moving; later, a worker inspects the broken item.",
    jargon: {
      "Dead letter queue": "A secondary queue where messages that cannot be delivered or processed successfully are stored for diagnosis.",
      "Message": "A unit of data transmitted between services in a messaging system."
    }
  }      
};       


// ───────────────────────────────────────────────
// LOCALSTORAGE HELPERS
// ───────────────────────────────────────────────

const STORAGE_KEY = "vibe-decoder-brain";

interface SavedDecode {
  id: string;
  rawInput: string;
  result: DecodedResult;
  savedAt: string;
}

function loadBrain(): SavedDecode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToBrain(entry: SavedDecode): void {
  const existing = loadBrain();
  const updated = [entry, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

function deleteFromBrain(id: string): void {
  const existing = loadBrain();
  const updated = existing.filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// ───────────────────────────────────────────────
// UI COMPONENTS
// ───────────────────────────────────────────────

const OutlinedButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  subtext?: string;
  className?: string;
}> = ({ children, onClick, disabled, type = "button", subtext, className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative inline-flex flex-col items-center justify-center
        border-2 border-[#ffffff] bg-[#000000] text-[#000000]
        rounded-[10px] px-[30px] py-[30px]
        transition-all duration-200
        hover:bg-[#ffffff] hover:text-[#000000]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#000000] disabled:hover:text-[#000000]
        ${className}
      `}
    >
      <span
        className="font-medium text-[30px] leading-[1.2] tracking-[-0.6px]"
        style={{ fontFamily: "'Staatliches', 'IPM', ui-sans-serif, system-ui, sans-serif" }}
      >
        {children}
      </span>
      {subtext && (
        <span
          className="mt-[10px] text-[13px] leading-[1.2] text-[#666666] font-normal"
          style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
        >
          {subtext}
        </span>
      )}
    </button>
  );
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p
    className="text-[16px] font-medium leading-[1.4] text-[#ff5c00] mb-[17px]"
    style={{ fontFamily: "'Helvetica Neue', 'neue-haas-grotesk-display', ui-sans-serif, system-ui, sans-serif" }}
  >
    {children}
  </p>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`border-2 border-[#ffffff] rounded-[10px] p-[30px] ${className}`}>
    {children}
  </div>
);

const JargonBadge: React.FC<{ term: string; definition: string }> = ({ term, definition }) => (
  <div className="border border-[#666666] rounded-[10px] px-[17px] py-[11px]">
    <span
      className="text-[#ff5c00] text-[13px] font-normal leading-[1.2]"
      style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
    >
      {term}
    </span>
    <span
      className="text-[#666666] text-[13px] font-normal leading-[1.2] mx-[10px]"
      style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
    >
      —
    </span>
    <span
      className="text-[#ffffff] text-[13px] font-normal leading-[1.2]"
      style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
    >
      {definition}
    </span>
  </div>
);

// ───────────────────────────────────────────────
// MAIN COMPONENT
// ───────────────────────────────────────────────

export default function VibeDecoder() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<DecodedResult | null>(null);
  const [matchedKey, setMatchedKey] = useState<string>("");
  const [brain, setBrain] = useState<SavedDecode[]>([]);
  const [showBrain, setShowBrain] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Load brain on mount
  useEffect(() => {
    setBrain(loadBrain());
  }, []);

  // Clear "just saved" state after delay
  useEffect(() => {
    if (justSaved) {
      const t = setTimeout(() => setJustSaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [justSaved]);

  const handleDecode = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Exact match first
    if (vibeLibrary[trimmed]) {
      setResult(vibeLibrary[trimmed]);
      setMatchedKey(trimmed);
      return;
    }

    // Fuzzy match: check if input contains any library key
    for (const key of Object.keys(vibeLibrary)) {
      if (trimmed.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(trimmed.toLowerCase())) {
        setResult(vibeLibrary[key]);
        setMatchedKey(key);
        return;
      }
    }

    // No match
    setResult(null);
    setMatchedKey("");
  }, [input]);

  const handleSave = useCallback(() => {
    if (!result || !matchedKey) return;
    const entry: SavedDecode = {
      id: crypto.randomUUID(),
      rawInput: input,
      result,
      savedAt: new Date().toISOString(),
    };
    saveToBrain(entry);
    setBrain(loadBrain());
    setJustSaved(true);
  }, [result, matchedKey, input]);

  const handleDelete = useCallback((id: string) => {
    deleteFromBrain(id);
    setBrain(loadBrain());
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleDecode();
    }
  };

  return (
    <div
      className="min-h-screen bg-[#000000] text-[#ffffff] flex flex-col items-center"
      style={{ fontFamily: "'Helvetica Neue', 'neue-haas-grotesk-display', ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* Decorative corner brackets */}
      <div className="fixed top-[30px] left-[30px] w-[35px] h-[35px] border-l-2 border-t-2 border-[#ffffff] opacity-30 pointer-events-none" />
      <div className="fixed top-[30px] right-[30px] w-[35px] h-[35px] border-r-2 border-t-2 border-[#ffffff] opacity-30 pointer-events-none" />
      <div className="fixed bottom-[30px] left-[30px] w-[35px] h-[35px] border-l-2 border-b-2 border-[#ffffff] opacity-30 pointer-events-none" />
      <div className="fixed bottom-[30px] right-[30px] w-[35px] h-[35px] border-r-2 border-b-2 border-[#ffffff] opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-[720px] mt-[156px] mb-[35px] px-[30px] text-center">
        <h1
          className="text-[60px] font-medium leading-[1.3] tracking-[-1.2px] text-[#ffffff] mb-[25px]"
          style={{ fontFamily: "'Staatliches', 'IPM', ui-sans-serif, system-ui, sans-serif" }}
        >
          VIBE DECODER
        </h1>
        <p className="text-[16px] font-medium leading-[1.4] text-[#ff5c00]">
          PASTE THE JARGON. GET THE TRUTH.
        </p>
      </header>

      {/* Input Section */}
      <main className="w-full max-w-[720px] px-[30px] flex flex-col gap-[10px]">
        <Card>
          <SectionLabel>INPUT RAW CODE / JARGON</SectionLabel>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your corporate gibberish here..."
            className="w-full bg-[#000000] border-2 border-[#ffffff] rounded-[10px] p-[17px] text-[16px] font-medium leading-[1.4] text-[#ffffff] placeholder-[#666666] resize-none focus:outline-none focus:border-[#ff5c00] transition-colors"
            style={{ fontFamily: "'Helvetica Neue', 'neue-haas-grotesk-display', ui-sans-serif, system-ui, sans-serif" }}
            rows={4}
          />
          <div className="flex items-center justify-between mt-[17px]">
            <span
              className="text-[10px] leading-[1] text-[#666666]"
              style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
            >
              {input.length} CHARS · CMD+ENTER TO DECODE
            </span>
            <div className="flex gap-[10px]">
              <OutlinedButton
                onClick={() => {
                  setInput("");
                  setResult(null);
                  setMatchedKey("");
                }}
                subtext="CLEAR"
              >
                RESET
              </OutlinedButton>
              <OutlinedButton onClick={handleDecode} subtext="TRANSLATE">
                DECODE
              </OutlinedButton>
            </div>
          </div>
        </Card>

        {/* Result Section */}
        {result && (
          <div className="mt-[35px] flex flex-col gap-[10px]">
            <Card>
              <SectionLabel>PLAIN ENGLISH</SectionLabel>
              <p
                className="text-[16px] font-medium leading-[1.4] text-[#ffffff] mb-[25px]"
                style={{ fontFamily: "'Helvetica Neue', 'neue-haas-grotesk-display', ui-sans-serif, system-ui, sans-serif" }}
              >
                {result.plainEnglish}
              </p>

              <SectionLabel>REAL-WORLD ANALOGY</SectionLabel>
              <p
                className="text-[16px] font-medium leading-[1.4] text-[#ffffff] mb-[25px] italic"
                style={{ fontFamily: "'Helvetica Neue', 'neue-haas-grotesk-display', ui-sans-serif, system-ui, sans-serif" }}
              >
                “{result.analogy}”
              </p>

              <SectionLabel>JARGON BREAKDOWN</SectionLabel>
              <div className="flex flex-wrap gap-[10px] mb-[25px]">
                {Object.entries(result.jargon).map(([term, definition]) => (
                  <JargonBadge key={term} term={term} definition={definition} />
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-[#666666] pt-[17px]">
                <span
                  className="text-[10px] leading-[1] text-[#666666]"
                  style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
                >
                  MATCHED: {matchedKey.slice(0, 40)}
                  {matchedKey.length > 40 ? "…" : ""}
                </span>
                <OutlinedButton
                  onClick={handleSave}
                  subtext={justSaved ? "SAVED ✓" : "LOCALSTORAGE"}
                  className={justSaved ? "border-[#ff5c00]" : ""}
                >
                  {justSaved ? "SAVED" : "SAVE TO BRAIN"}
                </OutlinedButton>
              </div>
            </Card>
          </div>
        )}

        {/* No Match State */}
        {result === null && input.trim() && (
          <div className="mt-[35px]">
            <Card>
              <SectionLabel>NO MATCH FOUND</SectionLabel>
              <p
                className="text-[16px] font-medium leading-[1.4] text-[#666666]"
                style={{ fontFamily: "'Helvetica Neue', 'neue-haas-grotesk-display', ui-sans-serif, system-ui, sans-serif" }}
              >
                That phrase isn't in our dictionary yet. Try pasting one of the known phrases exactly, or check the Brain for saved decodes.
              </p>
            </Card>
          </div>
        )}

        {/* Brain Toggle */}
        <div className="mt-[35px] flex justify-center">
          <OutlinedButton
            onClick={() => setShowBrain((s) => !s)}
            subtext={`${brain.length} ENTRIES`}
          >
            {showBrain ? "HIDE BRAIN" : "VIEW BRAIN"}
          </OutlinedButton>
        </div>

        {/* Brain Section */}
        {showBrain && (
          <div className="mt-[10px] mb-[156px] flex flex-col gap-[10px]">
            {brain.length === 0 ? (
              <Card>
                <p
                  className="text-[16px] font-medium leading-[1.4] text-[#666666] text-center"
                  style={{ fontFamily: "'Helvetica Neue', 'neue-haas-grotesk-display', ui-sans-serif, system-ui, sans-serif" }}
                >
                  Your Brain is empty. Decode something and save it.
                </p>
              </Card>
            ) : (
              brain.map((entry) => (
                <Card key={entry.id} className="relative">
                  <div className="flex items-start justify-between gap-[17px]">
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[10px] leading-[1] text-[#666666] mb-[11px]"
                        style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
                      >
                        {new Date(entry.savedAt).toLocaleString()}
                      </p>
                      <p
                        className="text-[13px] font-normal leading-[1.2] text-[#ffffff] mb-[11px] truncate"
                        style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
                      >
                        {entry.rawInput}
                      </p>
                      <p
                        className="text-[16px] font-medium leading-[1.4] text-[#ff5c00]"
                        style={{ fontFamily: "'Helvetica Neue', 'neue-haas-grotesk-display', ui-sans-serif, system-ui, sans-serif" }}
                      >
                        {entry.result.plainEnglish}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="shrink-0 border border-[#666666] rounded-[10px] px-[11px] py-[11px] text-[10px] text-[#666666] hover:border-[#ff5c00] hover:text-[#ff5c00] transition-colors"
                      style={{ fontFamily: "'Arial', ui-sans-serif, system-ui, sans-serif" }}
                    >
                      DELETE
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      {/* Footer spacer for spacious density */}
      <div className="h-[156px]" />
    </div>
  );
}
