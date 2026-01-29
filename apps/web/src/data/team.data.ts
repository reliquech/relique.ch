export interface TeamMember {
  id: string;
  name: string;
  role: string;
  sub: string;
}

export interface ExtendedTeamMember extends TeamMember {
  tagline?: string;
  watermark?: string;
  expertiseChips?: string[];
  credentials?: string[];
  technicalStack?: { heading: string; items: string[] }[];
  fullBio?: {
    overview?: string;
    links?: {
      linkedin?: string;
      email?: string;
      profile?: string;
    };
  };
}

export const teamMembers: ExtendedTeamMember[] = [
  {
    id: "constance",
    name: "Constance Bernasconi",
    role: "Co-founder & Strategic Director",
    sub: "constance.a.bernasconi@relique.ch",
    tagline:
      "Providing the financial and investment framework underpinning Relique.co, grounded in institutional-grade discipline.",
    watermark: "R",
    expertiseChips: [
      "Global Wealth Management",
      "Strategic Capital Structuring",
      "Valuation Logic",
      "Risk Management",
      "Portfolio Construction",
    ],
    credentials: [
      "Bs.c Business Administration at WWU Münster",
      "Ms.c Finance at Uni HSG",
      "Chief Investment Officer at Confoederatino Partners",
      "Ex Portfolio Manager at UBS",
      "Certified Financial Analyst Level II",
      "Independent ETF analyst",
    ],
    fullBio: {
      overview:
        "Constance provides the financial and investment framework underpinning Relique.co, ensuring that the company's approach to memorabilia is grounded in institutional-grade financial discipline. As an ex portfolio manager at UBS, one of Europe's leading financial institutions, and now the Chief Investment Officer of Confoederatino Partners, a growing Boutique Wealth Management Firm, he brings a sophisticated understanding of global wealth management, risk management, and portfolio construction to the table.\n\nAt Relique.co, Constance applies this expertise to bridge the gap between culturally significant collectibles and credible alternative assets. He advises on strategic capital structuring, valuation logic, and long-term value preservation, aligning Relique's offerings with the standards expected by professional investors. While Relique's technology ensures objective authentication, Constance ensures that every decision is anchored in financial rigor—positioning Relique not merely as a marketplace, but as a disciplined platform built for sustainable, long-term capital allocation.",
      links: { email: "constance.a.bernasconi@relique.ch" },
    },
  },
  {
    id: "harvey",
    name: "Harvey Wilder",
    role: "Co-founder, Board Advisor",
    sub: "harvey.wilder@relique.ch",
    tagline:
      "Applying quantitative precision and institutional methodologies to the emerging memorabilia asset class.",
    watermark: "R",
    expertiseChips: [
      "Quantitative Analysis",
      "Portfolio Construction",
      "Risk-Adjusted Capital",
      "Valuation Frameworks",
      "Performance Metrics",
    ],
    credentials: [
      "General Partner at Mercer & Co.",
      "Bs.c Applied Mathematics & Data Science at UC Berkeley",
      "MBA at Boston College Carroll School of Management",
    ],
    fullBio: {
      overview:
        "Harvey brings the discipline and analytical rigor of top-tier American quants to Relique.co's valuation and investment framework. He specializes in portfolio construction, performance analysis, and risk-adjusted capital allocation across sophisticated investment mandates.\n\nHolding a Master of Business Administration from the Boston College Carroll School of Management, Harvey applies quantitative precision and institutional methodologies to the emerging memorabilia asset class. At Relique.co, he advises on valuation logic, reporting standards, and performance metrics—helping translate culturally significant sports artifacts into assets that are measurable, comparable, and credible within a global investment context. His role is pivotal in aligning collector enthusiasm with market reality, ensuring that Relique's assets meet the expectations of professional investors while maintaining their intrinsic cultural value.",
      links: { email: "harvey.wilder@relique.ch" },
    },
  },
  {
    id: "kiet",
    name: "Do Tuan Kiet",
    role: "Co-founder & Head of Sea Operations",
    sub: "tuan.kiet.do@relique.ch",
    tagline:
      "Strategic lead for global operations; architect of Relique's mission to institutionalize memorabilia as a credible asset class.",
    watermark: "R",
    expertiseChips: [
      "Capital Management",
      "Investment Analysis",
      "Risk Assessment",
      "Global Operations",
      "Strategic Direction",
      "Institutionalization",
    ],
    credentials: [
      "Operations Manager at Warden Wealth Partners",
      "Certified Financial Analyst Level II",
      "Bs.c Finance at University of South Florida, Dean's List",
      "Owner/Co-founder at Finance Impact Organization",
    ],
    fullBio: {
      overview:
        "Tuan Kiet is one of the co-founders of Relique.co and the strategic lead for the firm's global operations. As a seasoned authority in the realms of finance and investment, Tuan's career is defined by a sophisticated command of capital management, investment analysis, and rigorous risk assessment. He serves as a cornerstone of the firm's board, channeling years of institutional expertise into the agile strategies that define Relique's market presence.\n\nAt the heart of his work is a transformative vision for the alternative investment landscape. Tuan is the primary architect of Relique's mission to institutionalize memorabilia, elevating it from mere sentiment to a credible, high-performance financial asset class through global expansion.",
      links: {
        linkedin: "https://www.linkedin.com/in/do-tuan-kiet",
        email: "tuan.kiet.do@relique.ch",
      },
    },
  },
  {
    id: "son",
    name: "Vu Truong Son",
    role: "SEA Regional Coordinator, Board Advisor",
    sub: "son.vu.truong@relique.ch",
    tagline:
      "Founder of St.B Sporting Ecosystem, whose AI technology department powers Relique.co's authentication engine with Swiss-standard precision.",
    watermark: "R",
    expertiseChips: [
      "Applied AI",
      "Authentication Technology",
      "International Finance",
      "Sporting Ecosystems",
      "Market Intelligence",
      "Scalable Solutions",
    ],
    credentials: [
      "Dual Degrees Bs.c International Business Administration – Bs.c International Finance at Foreign Trade University, Dean's List",
      "Ms.c Applied A.I at Swiss UMEF University of Applied Sciences",
      "Founder & Director of St.B Ecosystem",
      "Official Real Madrid Fanclub Vietnam Vice-president",
      "X-Memorabilia Strategic Partner & Exclusive Distributor",
    ],
    fullBio: {
      overview:
        "Vu Truong Son is the founder of St. B Sporting Ecosystem—of which the Artificial Intelligence Department, St.B AI—powers Relique.co's Artificial Intelligence authentication technology. He holds dual degrees in International Business Administration and International Finance at Foreign Trade University, one of Vietnam's finest institutions, and a Master's in Applied AI from Swiss UMEF University of Applied Sciences. Widely known as an avid collector of sporting memorabilia, Son brings to the table knowledge and exposure rooted in years of experience as a hobbyist. His sporting ecosystem, St.B, has recently announced a partnership with a rising and trusted memorabilia company, X-Memorabilia, further strengthening its global network and expertise within the sector.\n\nTogether with years of extensive experience in multiple lines of business, Son is exceptionally well positioned to guide the application of advanced technology within the framework of a deep and nuanced understanding of the market, and also act as a bridge for the firm's expansion, underpinning Relique.co's commitment to objective, reliable, and scalable authentication.",
      links: {
        linkedin: "https://www.linkedin.com/in/vu-truong-son",
        email: "son.vu.truong@relique.ch",
      },
    },
  },
  {
    id: "rapin",
    name: "Rapin Neupane",
    role: "Board Advisor, Head of Institutional Relations",
    sub: "rapin.neupane@relique.ch",
    tagline:
      "Digital strategy expertise and high-level sports diplomacy; bridge to elite European football institutions.",
    watermark: "R",
    expertiseChips: [
      "Sports Diplomacy",
      "Institutional Relations",
      "Digital Strategy",
      "European Football Networks",
      "Partnership Development",
      "Cross-Border Strategy",
    ],
    credentials: [
      "Ex Head of E-Commerce at Snowy Horizon Treks and Expedition",
      "Digital Marketing Director at Xenatech Nepal Pvt. Ltd",
      "Bs.c Business Administration at The British College",
      "Founder & President at Peña Madridista Everest",
    ],
    fullBio: {
      overview:
        "Rapin Neupane brings a rare combination of digital strategy expertise and high-level sports diplomacy to the advisory board of Relique.co. Graduated from The British College—one of Nepal's top business schools—he currently holds the role of Digital Marketing Director at Xenatech Nepal Pvt. Ltd. and previously served as Head of E-Commerce at Snowy Horizon Treks and Expedition, where he developed a strong foundation in digital community building and cross-border commercial strategy.\n\nBeyond his professional background in digital leadership, Rapin's principal value lies in his exceptional ability to build and maintain institutional relationships at the highest levels of European football. As the founder of Peña Madridista Everest, he has successfully established and sustained direct channels of engagement with senior leadership within Spanish football's elite institutions. His longstanding rapport with key figures—including Real Madrid President Florentino Pérez and Director of Institutional Relations Emilio Butragueño—provides Relique.co with a distinctive strategic advantage. In his advisory capacity, Rapin leverages these elite relationships to facilitate high-level dialogue, serves as a critical bridge in supporting institutional access, and unlock exclusive partnership opportunities.",
      links: {
        linkedin: "https://www.linkedin.com/in/rapin-neupane",
        email: "rapin.neupane@relique.ch",
      },
    },
  },
  {
    id: "phong",
    name: "Doan Trung Phong",
    role: "Head of St.B AI",
    sub: "trung.phong.doan@relique.ch",
    tagline:
      "Deep technical expertise and practical innovation; lead architect of the A.I Department behind Relique's authentication.",
    watermark: "R",
    expertiseChips: [
      "Deep Learning",
      "Fraud Detection",
      "Transfer Learning",
      "Computer Vision",
      "NLP & LLMs",
      "Model Optimization",
    ],
    credentials: [
      "Bs.c Computer Science",
      "Ex Data Scientist at TLU, A.I Laboratory",
      "Ex Lecturer at TLU, Faculty of Information Technology",
      "AI Engineer at VNPAY",
      "2021 ICPC Vietnam National Programming Contest Prize Winner",
      "Research Papers on Springer Nature: Computational Intelligence, Data Processing and Engineering",
    ],
    technicalStack: [
      {
        heading: "Programming Languages",
        items: ["Python", "C++", "SQL", "Shell Scripting"],
      },
      {
        heading: "Libraries & Frameworks",
        items: [
          "Data & ML: Pandas, PySpark, Scikit-learn",
          "Deep Learning: PyTorch (RNNs, LSTMs, GRUs, CNNs, DQN, Graph NN)",
          "NLP & LLMs: Hugging Face, Transformers (BERT, SBERT), Large Language Models",
          "Streaming: Kafka",
        ],
      },
      {
        heading: "Development & Deployment",
        items: ["Backend: FastAPI, Flask", "Containerization: Docker", "Automation: N8N"],
      },
      {
        heading: "Techniques & Methodologies",
        items: [
          "Deep Learning: Hyperparameter Tuning, Transfer Learning, Fine-tuning Pre-trained Models, Custom Loss Functions",
          "Data Collection: Web Scraping (Selenium, BeautifulSoup)",
          "Analysis: Advanced Feature Engineering, Time Series Analysis, NLP, Algorithm Development",
        ],
      },
    ],
    fullBio: {
      overview:
        "Doan Trung Phong is AI Engineer at VNPAY; Ex Data Scientist and Lecturer at Thang Long University, Faculty of Information Technology. As a former University Lecturer and A.I Lab Data Scientist, with years of experience in AI-Engineering on top of that, he brings to the table an invaluable combination of deep technical expertise and practical innovation. Throughout the years he has been the mind behind various high-stakes applications, most notable among which is a transaction fraud detector for a leading \"big 4\" commercial bank and automated data collector for analysis agents.\n\nHis work leverages fine-tuned, pre-trained deep learning models, employing techniques such as hyperparameter tuning, transfer learning, and custom loss functions, which would all now be transferred onto his work as the lead architecture of the A.I Department behind Relique's Authentication.",
      links: {
        linkedin: "https://www.linkedin.com/in/doan-trung-phong",
        email: "trung.phong.doan@relique.ch",
      },
    },
  },
  {
    id: "tan",
    name: "Trinh Duc Tan",
    role: "AI Engineer",
    sub: "tan.trinh.duc@relique.ch",
    tagline:
      "Bridging academic research and industrial-grade visual inspection; engineering core AI authentication protocols at Relique.",
    watermark: "R",
    expertiseChips: [
      "Computer Vision",
      "OCR & Object Detection",
      "Visual Inspection",
      "Deep Learning",
      "Distributed Computing",
    ],
    credentials: [
      "Bs.c Information Technology",
      "Vietnam Informatics Olympiad National Third Prize",
      "Ex Lecturer at TLU, Faculty of Information Technology",
      "Ex Researcher at TLU, A.I Laboratory",
      "A.I Engineer at TDMK Company Ltd",
      "Contribution in 5th International Conference on Artificial Intelligence and Computational Intelligence (AICI 2024)",
      "Publication in \"Explainable AI and Other Soft Computing Techniques: Biomedical and Related Applications\" (Springer Nature, 2024)",
    ],
    technicalStack: [
      {
        heading: "Programming Languages",
        items: ["Python", "C++", "C#", "SQL", "Java"],
      },
      {
        heading: "Machine Learning & Deep Learning",
        items: [
          "Frameworks: TensorFlow, Scikit-learn",
          "Techniques: Supervised & Unsupervised Learning, A/B Testing, Distributed Computing, Explainable AI",
          "Specialized: Zebra Aurora Deep Learning (Industrial AI)",
        ],
      },
      {
        heading: "Computer Vision",
        items: [
          "Libraries: OpenCV, Matrox Image Library (MIL)",
          "Applications: OCR, Object Detection, Visual Inspection Systems, Hardware-Model Integration",
        ],
      },
      {
        heading: "Data Visualization & Web",
        items: ["Visualization: Matplotlib, Seaborn", "Backend: Flask"],
      },
      {
        heading: "Tools",
        items: ["Docker", "Git", "AWS", "MySQL", "Visualize Tool", "N8N"],
      },
    ],
    fullBio: {
      overview:
        "Trinh Duc Tan is A.I Engineer at TDMK Company Ltd. Tan's background is defined by the practical application of complex theory, ranging from optimizing distributed computing models—research distinguished by Springer Nature—to engineering industrial-grade visual inspection systems at TDMK.\n\nHe brings to the team a specialized command of computer vision and deep learning, with proven expertise in implementing OCR, object detection, and hardware-model integration on active production lines. This distinct ability to bridge the gap between academic research and deployment is now being utilized to engineer the core AI authentication protocols at Relique.",
      links: {
        linkedin: "https://www.linkedin.com/in/trinh-duc-tan",
        email: "tan.trinh.duc@relique.ch",
      },
    },
  },
  {
    id: "manh",
    name: "Nguyen Huy Manh",
    role: "AI Engineer",
    sub: "",
    tagline:
      "Time-series forecasting and predictive modeling; optimizing performance metrics and risk management for Relique.",
    watermark: "R",
    expertiseChips: [
      "Time-Series Forecasting",
      "Algorithmic Trading",
      "GenAI Verification",
      "Risk Management Metrics",
      "Large Language Models",
      "Predictive Modeling",
    ],
    credentials: [
      "A.I Engineer at Pixta Vietnam",
      "Bs.c Artificial Intelligence at TLU",
      "MindX School of Technology Data Analyst",
      "Ex Quantitative Researcher at Finspro Company Ltd.",
      "Data Scientist at TLU, A.I Laboratory",
    ],
    technicalStack: [
      {
        heading: "Core AI & GenAI Frameworks",
        items: [
          "Deep Learning: PyTorch",
          "LLM & Agents: LangChain, LlamaIndex, Hugging Face",
          "Computer Vision: OpenCV",
          "Specializations: LLM, VLM, VQA, Face Recognition, NSFW Detection, GenAI Verification",
        ],
      },
      {
        heading: "MLOps & Development Tools",
        items: [
          "Experiment Tracking: ClearML",
          "Containerization: Docker",
          "Backend: FastAPI",
          "Automation: N8N",
          "Cloud: AWS",
          "Version Control: Git",
        ],
      },
      {
        heading: "Data & Analytics",
        items: [
          "Databases: MySQL, Database Management Systems",
          "Techniques: Image Preprocessing, Data Warehousing, Automated Data Pipelines",
          "Financial Analytics: Quantitative Analysis, Algorithmic Trading (Forex, Derivatives), Risk Management (Sharpe Ratio, Max Drawdown)",
        ],
      },
    ],
    fullBio: {
      overview:
        "Nguyen Huy Manh is AI Engineer at Pixta Vietnam. Mánh's experience is grounded in the rigorous analysis of high-volatility data, having developed and backtested over 40 algorithmic trading strategies for derivative markets during his tenure at Finpros and Thang Long AI Lab.\n\nHe possesses sharp expertise in time-series forecasting and predictive modeling, utilizing advanced architectures such as RNNs, LSTMs, and Transformers to build automated, 24/7 decision-making systems. His work—distinguished by a presentation at the AICI 2025 conference—demonstrates a strong capacity for optimizing performance metrics and risk management protocols, skills he now applies to the challenges at Relique.",
      links: { linkedin: "https://www.linkedin.com/in/nguyen-huy-manh" },
    },
  },
];
