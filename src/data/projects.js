export const PROJECT_FILTERS = [
  { id: 'all', label: 'All', icon: 'fas fa-layer-group' },
  { id: 'react', label: 'React', icon: 'fab fa-react' },
  { id: 'node', label: 'Node.js', icon: 'fab fa-node-js' },
  { id: 'python', label: 'Python', icon: 'fab fa-python' },
  { id: 'javascript', label: 'JavaScript', icon: 'fab fa-js' },
  { id: 'css', label: 'CSS', icon: 'fab fa-css3-alt' },
  { id: 'accessibility', label: 'Accessibility', icon: 'fas fa-universal-access' },
  { id: 'java', label: 'Java', icon: 'fab fa-java' },
]

export const projects = [
  {
    id: 'trail',
    title: 'Trail – Indoor Accessibility & Sensory-Aware Navigation',
    description:
      'Trail is an indoor accessibility and sensory-aware navigation engine. It helps users find routes that avoid physical barriers (stairs, narrow doors, broken elevators), anticipate sensory-heavy areas (noise, crowds, lighting), receive calm human-readable warnings, and get alternate paths when environments become overwhelming. We unified physical and sensory accessibility into a single system—rare in navigation—and designed an MVP that works without sensors using smart time/location modeling.',
    iconClass: 'fas fa-route',
    badge: { label: 'Accessibility & AI', icon: 'fas fa-universal-access', gradient: 'from-teal-400 to-cyan-500' },
    features: [
      'Routes that avoid physical barriers (stairs, narrow doors, broken elevators)',
      'Anticipate sensory-heavy areas: noise, crowd density, lighting intensity',
      'Calm, human-readable warnings along routes; alternate paths when overwhelming',
      'Unified accessibility graph: parsed floor plans → nodes with physical + sensory attributes',
      'MongoDB for map and crowdsourced data; Gemini for labels, warnings, issue summaries; ElevenLabs TTS',
      'Aligned with Canadian accessibility priorities (AODA + experiential inclusion)',
    ],
    tech: ['React', 'Node.js', 'Python', 'JavaScript', 'MongoDB', 'Gemini', 'ElevenLabs', 'Figma', 'Snowflake', 'CSS'],
    categories: ['react', 'node', 'python', 'javascript', 'css', 'accessibility'],
    links: { live: '#', code: '#' },
  },
  {
    id: 'wisely',
    title: 'Wisely – Goal-Based Spending Tracker',
    description:
      'Wisely helps users set goals and track progress with their day-to-day spending. Create, edit, and delete goals, then connect your bank via Plaid (sandbox) so transactions sync automatically. View transactions in the Transactions tab; with Plaid’s categories, goal progress updates in real time. The app includes a local AI assistant (Ollama) for spending insights and recommendations.',
    iconClass: 'fas fa-piggy-bank',
    badge: { label: 'Fintech & AI', icon: 'fas fa-chart-line', gradient: 'from-emerald-400 to-green-500' },
    features: [
      'Full CRUD goals; connect bank via Plaid (sandbox) for live test transactions',
      'Transactions tab with Plaid categories; goals update automatically from spending',
      'Local AI assistant (Ollama) for spending patterns and recommendations',
      'Secure data handling, real-time goal progress, clean dashboard with dynamic visuals',
      'SQLite + Prisma ORM; Node.js & Express backend; React frontend',
    ],
    tech: ['React', 'Node.js', 'Express', 'SQLite', 'Prisma', 'Plaid', 'Ollama'],
    categories: ['react', 'node', 'javascript'],
    links: { live: '#', code: '#' },
  },
  {
    id: 'qr-code-generator',
    title: 'QR Code Generator (Node.js CLI)',
    description:
      'A simple Node.js command-line application that generates a QR code from a user-provided URL. Uses Inquirer for prompts, qr-image for QR generation, and Node’s fs module to save the image (qr_code.png) and the URL to a text file (URL.txt).',
    iconClass: 'fas fa-qrcode',
    badge: { label: 'CLI', icon: 'fas fa-terminal', gradient: 'from-violet-400 to-purple-500' },
    features: [
      'Prompt for a URL using Inquirer',
      'Generate a QR code image (qr_code.png) from the entered URL',
      'Save the original URL to URL.txt',
      'Demonstrates npm packages and Node.js file system operations',
    ],
    tech: ['Node.js', 'JavaScript', 'Inquirer', 'qr-image', 'fs'],
    categories: ['node', 'javascript'],
    links: { live: '#', code: 'https://github.com/yourusername/qr-code-generator' },
  },
  {
    id: 'huffman-compression',
    title: 'File Compression Tool (Huffman Coding)',
    description:
      'A file compression and decompression tool in Java using Huffman Coding. Demonstrates OOP (inheritance, abstraction), data structures (binary trees, hash maps, priority queues), and lossless compression to .huff format.',
    iconClass: 'fas fa-file-archive',
    badge: { label: 'Algorithms', icon: 'fas fa-sitemap', gradient: 'from-amber-400 to-orange-500' },
    features: [
      'Compress text files to .huff format; decompress back to original text',
      'Implements Huffman Coding for lossless compression',
      'Clear class structure: Compressor, Decompressor, HuffmanTree, HuffmanNode',
      'Uses binary trees, hash maps, and priority queues',
    ],
    tech: ['Java', 'Huffman Coding', 'Data Structures', 'OOP'],
    categories: ['java'],
    links: { live: '#', code: '#' },
  },
  {
    id: 'book-catalog',
    title: 'Book Catalog System',
    description:
      'A book catalog system for managing and organizing your library collection. Browse and search books, add and edit entries, and keep catalog metadata—title, author, ISBN, genre—in one simple, intuitive interface.',
    iconClass: 'fas fa-book-open',
    badge: { label: 'CRUD App', icon: 'fas fa-book', gradient: 'from-sky-400 to-blue-500' },
    features: [
      'Browse and search books',
      'Add, edit, and remove book entries',
      'Catalog metadata: title, author, ISBN, genre, and more',
      'Simple, intuitive interface',
    ],
    tech: ['JavaScript', 'HTML', 'CSS'],
    categories: ['javascript', 'css'],
    links: { live: '#', code: '#' },
  },
  {
    id: 'before-the-appointment',
    title: 'Before the Appointment – Health Translator (Frontend)',
    description:
      'A patient-facing web app that helps users clearly communicate symptoms to doctors. Input symptoms via text, voice, or interactive controls; get AI-generated 30-second clinical-style summaries and a forgotten-details list. Printable, doctor-ready output. Does not diagnose or give medical advice—only supports organizing and communicating symptoms. Built for clarity, accessibility, and better patient–doctor communication.',
    iconClass: 'fas fa-stethoscope',
    badge: { label: 'Healthcare & Accessibility', icon: 'fas fa-heartbeat', gradient: 'from-rose-400 to-red-500' },
    features: [
      'Input symptoms via text, voice, or interactive controls (buttons, sliders, icons)',
      '30-second clinical-style summary and forgotten-details list; printable output',
      'Optional daily symptom tracking with trends to spot patterns',
      'Accessible design for users with anxiety, language barriers, or memory challenges',
      'Ethical, safe, human-centered; supports communication only—no diagnosis or treatment advice',
    ],
    tech: ['React', 'JavaScript', 'CSS'],
    categories: ['react', 'javascript', 'css', 'accessibility'],
    links: { live: '#', code: '#' },
  },
]
