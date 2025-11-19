// Centralized data for articles
export const allArticles = [
  {
    id: 1,
    title: "Breaking: Major Development in Local Infrastructure Project",
    excerpt:
      "City officials announce groundbreaking plans for the new transportation hub that will transform the downtown area and improve connectivity for thousands of residents.",
    image: "/modern-city-infrastructure-development.jpg",
    category: "Local News",
    tags: ["infrastructure", "development", "transportation"],
    author: "Sarah Johnson",
    authorId: "sarah-johnson",
    date: "2024-01-15",
    readTime: "5 min read",
    content: `City officials have announced groundbreaking plans for a new transportation hub that promises to transform the downtown area. The project, valued at $50 million, will improve connectivity for thousands of residents and create hundreds of jobs.

The new hub will integrate bus, rail, and bike-sharing services in one central location, making it easier for commuters to switch between different modes of transportation. Mayor Thompson stated, "This is a game-changer for our city's infrastructure."

Construction is expected to begin in the spring and will be completed within 18 months. The project has received widespread support from local businesses and community leaders.`,
  },
  {
    id: 2,
    title: "Community Garden Initiative Brings Neighbors Together",
    excerpt:
      "Local residents transform vacant lot into thriving community space, fostering connections and sustainable living.",
    image: "/community-garden-with-people.jpg",
    category: "Community",
    tags: ["community", "gardening", "sustainability"],
    author: "Michael Chen",
    authorId: "michael-chen",
    date: "2024-01-14",
    readTime: "4 min read",
    content: `What started as a small group of neighbors has blossomed into a thriving community garden that brings together residents from all walks of life. The garden, located on a previously vacant lot, now features over 50 individual plots and several communal growing areas.

Participants share gardening tips, harvest vegetables, and build lasting friendships. "It's not just about growing food," says organizer Maria Santos. "It's about growing community."

The initiative has inspired similar projects in neighboring areas and has become a model for urban agriculture programs across the region.`,
  },
  {
    id: 3,
    title: "Tech Startup Launches Innovative Education Platform",
    excerpt: "New platform aims to revolutionize online learning with AI-powered personalized curriculum for students.",
    image: "/students-using-technology-education.jpg",
    category: "Technology",
    tags: ["technology", "education", "AI", "startup"],
    author: "Emily Rodriguez",
    authorId: "emily-rodriguez",
    date: "2024-01-13",
    readTime: "6 min read",
    content: `A local tech startup has launched an innovative education platform that uses artificial intelligence to create personalized learning experiences for students. The platform, called LearnSmart, adapts to each student's learning style and pace.

Early testing shows promising results, with students showing a 30% improvement in comprehension and retention. The platform is currently being piloted in three local schools with plans to expand regionally.

Founder Alex Kim explains, "We're not replacing teachers; we're giving them powerful tools to help every student succeed."`,
  },
  {
    id: 4,
    title: "Local Restaurant Scene Embraces Farm-to-Table Movement",
    excerpt:
      "Chefs partner with local farmers to bring fresh, sustainable ingredients to dining tables across the city.",
    image: "/fresh-farm-vegetables-restaurant.jpg",
    category: "Food & Culture",
    tags: ["food", "sustainability", "local business"],
    author: "David Park",
    authorId: "david-park",
    date: "2024-01-12",
    readTime: "5 min read",
    content: `The farm-to-table movement is gaining momentum in our city as more restaurants partner with local farmers to source fresh, sustainable ingredients. This trend is not only supporting local agriculture but also providing diners with healthier, more flavorful meals.

Chef Maria Gonzalez of The Green Table says, "When you use ingredients picked that morning, the difference in taste is incredible." Her restaurant now sources 80% of its produce from farms within a 50-mile radius.

The movement is also educating consumers about seasonal eating and the environmental benefits of supporting local food systems.`,
  },
  {
    id: 5,
    title: "Youth Sports Program Expands to Underserved Areas",
    excerpt:
      "New initiative provides free coaching and equipment to children in neighborhoods lacking recreational facilities.",
    image: "/children-playing-sports.jpg",
    category: "Sports",
    tags: ["sports", "youth", "community"],
    author: "Jessica Williams",
    authorId: "jessica-williams",
    date: "2024-01-11",
    readTime: "4 min read",
    content: `A new youth sports initiative is bringing free coaching and equipment to children in underserved neighborhoods. The program, called "Play for All," aims to provide equal access to sports and recreational activities regardless of economic background.

Over 200 children have already enrolled in programs ranging from soccer and basketball to swimming and tennis. Volunteer coaches from local high schools and colleges provide instruction and mentorship.

Program director James Martinez notes, "Sports teach valuable life skills like teamwork, discipline, and perseverance. Every child deserves that opportunity."`,
  },
  {
    id: 6,
    title: "Environmental Group Launches River Cleanup Campaign",
    excerpt: "Volunteers mobilize to restore local waterways and protect wildlife habitats through community action.",
    image: "/river-cleanup-volunteers.png",
    category: "Environment",
    tags: ["environment", "conservation", "community"],
    author: "Robert Taylor",
    authorId: "robert-taylor",
    date: "2024-01-10",
    readTime: "5 min read",
    content: `Local environmental group Green Rivers has launched an ambitious campaign to clean up and restore the city's waterways. The initiative has already attracted over 500 volunteers who have removed tons of trash and debris from local rivers and streams.

The cleanup efforts are part of a larger conservation project aimed at protecting wildlife habitats and improving water quality. Biologists have noted an increase in fish populations and the return of several bird species to the area.

"Clean rivers benefit everyone," says campaign coordinator Lisa Chen. "They're essential for wildlife, recreation, and our community's health."`,
  },
  {
    id: 7,
    title: "Art Exhibition Showcases Emerging Local Talent",
    excerpt:
      "Gallery opens doors to new artists, celebrating diverse perspectives and creative expression in the community.",
    image: "/art-gallery-exhibition.jpg",
    category: "Arts",
    tags: ["arts", "culture", "community"],
    author: "Amanda Lee",
    authorId: "amanda-lee",
    date: "2024-01-09",
    readTime: "3 min read",
    content: `The Downtown Gallery is hosting a groundbreaking exhibition featuring works from 15 emerging local artists. The show, titled "New Voices," celebrates diverse perspectives and creative expression in our community.

The exhibition includes paintings, sculptures, photography, and mixed media works that explore themes of identity, community, and social change. Many of the featured artists are showing their work publicly for the first time.

Gallery director Susan Park says, "We're committed to providing a platform for new talent and making art accessible to everyone in our community."`,
  },
]

export const categories = [
  { name: "All", slug: "all", icon: null },
  { name: "Local News", slug: "local-news", icon: "Newspaper" },
  { name: "Community", slug: "community", icon: "Users" },
  { name: "Technology", slug: "technology", icon: "Cpu" },
  { name: "Food & Culture", slug: "food-culture", icon: "UtensilsCrossed" },
  { name: "Sports", slug: "sports", icon: "Trophy" },
  { name: "Environment", slug: "environment", icon: "Leaf" },
  { name: "Arts", slug: "arts", icon: "Palette" },
]

export function getArticlesByCategory(category) {
  if (category === "all") return allArticles
  return allArticles.filter((article) => article.category.toLowerCase().replace(/\s+/g, "-") === category)
}

export function getArticlesByTag(tag) {
  return allArticles.filter((article) => article.tags.includes(tag))
}

export function getArticleById(id) {
  return allArticles.find((article) => article.id === Number.parseInt(id))
}

export const authors = [
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    bio: "Senior journalist covering local news and infrastructure development. With over 10 years of experience in investigative reporting, Sarah brings in-depth analysis to community issues.",
    email: "sarah.johnson@bloghub.com",
    social: {
      twitter: "@sarahjohnson",
      linkedin: "sarah-johnson",
    },
    joinedDate: "2020-03-15",
    articlesCount: 45,
  },
  {
    id: "michael-chen",
    name: "Michael Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    bio: "Community reporter passionate about grassroots movements and local initiatives. Michael believes in the power of storytelling to bring people together.",
    email: "michael.chen@bloghub.com",
    social: {
      twitter: "@michaelchen",
      linkedin: "michael-chen",
    },
    joinedDate: "2019-08-20",
    articlesCount: 38,
  },
  {
    id: "emily-rodriguez",
    name: "Emily Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    bio: "Technology and innovation writer exploring how tech shapes our daily lives. Emily has a background in computer science and a passion for making tech accessible to everyone.",
    email: "emily.rodriguez@bloghub.com",
    social: {
      twitter: "@emilyrodriguez",
      linkedin: "emily-rodriguez",
    },
    joinedDate: "2021-01-10",
    articlesCount: 52,
  },
  {
    id: "david-park",
    name: "David Park",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
    bio: "Food and culture critic with a love for local cuisine and culinary traditions. David explores the stories behind the food that brings communities together.",
    email: "david.park@bloghub.com",
    social: {
      twitter: "@davidpark",
      linkedin: "david-park",
    },
    joinedDate: "2020-06-05",
    articlesCount: 41,
  },
  {
    id: "jessica-williams",
    name: "Jessica Williams",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jessica",
    bio: "Sports journalist covering youth athletics and community sports programs. Jessica is dedicated to highlighting the positive impact of sports on young lives.",
    email: "jessica.williams@bloghub.com",
    social: {
      twitter: "@jessicawilliams",
      linkedin: "jessica-williams",
    },
    joinedDate: "2019-11-12",
    articlesCount: 36,
  },
  {
    id: "robert-taylor",
    name: "Robert Taylor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert",
    bio: "Environmental reporter focused on conservation and sustainability. Robert's work highlights the importance of protecting our natural resources for future generations.",
    email: "robert.taylor@bloghub.com",
    social: {
      twitter: "@roberttaylor",
      linkedin: "robert-taylor",
    },
    joinedDate: "2020-09-18",
    articlesCount: 33,
  },
  {
    id: "amanda-lee",
    name: "Amanda Lee",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amanda",
    bio: "Arts and culture writer celebrating creativity in all its forms. Amanda is passionate about showcasing local artists and making art accessible to everyone.",
    email: "amanda.lee@bloghub.com",
    social: {
      twitter: "@amandalee",
      linkedin: "amanda-lee",
    },
    joinedDate: "2021-02-28",
    articlesCount: 29,
  },
]

export function getAuthorById(id) {
  return authors.find((author) => author.id === id)
}

export function getArticlesByAuthor(authorId) {
  return allArticles.filter((article) => article.authorId === authorId)
}
