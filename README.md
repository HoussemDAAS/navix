<div align="center">

# 🚀 **NAVIX**
### *Growth Marketing Agency - Where Ideas Come to Life*

[![Last Commit](https://img.shields.io/github/last-commit/HoussemDAAS/navix?style=flat&logo=git&logoColor=white&color=4083b7)](https://github.com/HoussemDAAS/navix)
[![Language Count](https://img.shields.io/github/languages/count/HoussemDAAS/navix?style=flat&color=4083b7)](https://github.com/HoussemDAAS/navix)
[![Top Language](https://img.shields.io/github/languages/top/HoussemDAAS/navix?style=flat&color=4083b7)](https://github.com/HoussemDAAS/navix)

*Professional marketing agency website with AI-powered features, multilingual support, and modern web technologies*

---

## 🌟 **About Navix**

Navix is a cutting-edge **growth marketing agency** specializing in:
- 📈 **Marketing Strategy & Media Buying**
- 🎬 **Video Production & Editing** 
- 💻 **Web Development & E-commerce**
- 🎨 **UX/UI Design & Branding**
- 📧 **Email Marketing Systems**
- 📊 **Analytics & Performance Tracking**

With **100+ happy clients** and **30+ projects completed**, we help businesses scale through data-driven marketing solutions.

</div>

---

## 🛠️ **Tech Stack**

<div align="center">

### 🌐 Frontend
![Next.js](https://img.shields.io/badge/Next.js%2015-000000.svg?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React%2019-61DAFB.svg?style=flat&logo=React&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF.svg?style=flat&logo=framer&logoColor=white)

### 🔧 Backend & Services
![Sanity](https://img.shields.io/badge/Sanity%20CMS-F03E2F.svg?style=flat&logo=Sanity&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991.svg?style=flat&logo=OpenAI&logoColor=white)
![Pinecone](https://img.shields.io/badge/Pinecone%20Vector%20DB-026AFF.svg?style=flat&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-FF6F61.svg?style=flat&logoColor=white)

### 🌍 Internationalization
![next-intl](https://img.shields.io/badge/next--intl-000000.svg?style=flat&logo=next.js&logoColor=white)
![Multi-language](https://img.shields.io/badge/Languages-EN%20|%20FR%20|%20AR-4083b7.svg?style=flat)

### 🚀 Deployment
![Vercel](https://img.shields.io/badge/Vercel-000000.svg?style=flat&logo=vercel&logoColor=white)

</div>

---

## ✨ **Key Features**

### 🎯 **Marketing Focus**
- **Service Showcase**: Complete portfolio of marketing services
- **Client Case Studies**: Interactive project galleries with detailed results
- **Performance Metrics**: Real-time client success statistics
- **Industry Expertise**: Specialized solutions for different business sectors

### 🤖 **AI-Powered Experience**
- **Smart Contact Form**: AI-driven project consultation
- **Project Recommendations**: Vector-based content discovery
- **Personalized User Journey**: Intelligent service suggestions
- **Multi-language AI Chat**: Support in English, French, and Arabic

### 🌍 **Global Accessibility**
- **RTL Support**: Full Arabic language implementation
- **Cultural Adaptation**: Localized content and design patterns
- **Performance Optimized**: Fast loading across all regions
- **SEO Optimized**: Multi-language search optimization

### 📱 **Modern Web Experience**
- **Responsive Design**: Perfect experience on all devices
- **Advanced Animations**: Smooth Framer Motion interactions
- **Dynamic Content**: Real-time updates via Sanity CMS
- **Progressive Enhancement**: Works without JavaScript

### 🔒 **Enterprise Ready**
- **Type Safety**: Full TypeScript implementation
- **Security First**: Content Security Policy and best practices
- **Scalable Architecture**: Modular component system
- **Performance Monitoring**: Built-in analytics and tracking

---

## 🚀 **Getting Started**

### 📋 **Prerequisites**

```bash
Node.js 18+ 
npm or pnpm
Git
```

### 💻 **Installation**

```bash
# Clone the repository
git clone https://github.com/HoussemDAAS/navix.git
cd navix

# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env.local
# Configure your environment variables
```

### ⚙️ **Environment Setup**

Create a `.env.local` file with:

```env
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_key

# Pinecone (for vector search)
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_environment
PINECONE_INDEX=your_index_name

# Resend (for email)
RESEND_API_KEY=your_resend_key

# Security
PINECONE_SYNC_SECRET=your_sync_secret
```

### 🏃‍♂️ **Development**

```bash
# Start development server
npm run dev
# or
pnpm dev

# Build for production
npm run build
npm start

# Content management
npm run extract-content  # Extract content for AI
npm run upsert-content   # Sync to Pinecone
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

---

## 📁 **Project Structure**

```
navix/
├── src/
│   ├── app/                 # Next.js 15 App Router
│   │   ├── [locale]/       # Internationalized routes
│   │   ├── api/            # API endpoints
│   │   └── studio/         # Sanity Studio
│   ├── components/         # Reusable components
│   │   ├── sections/       # Page sections
│   │   ├── magicui/        # UI components
│   │   └── ui/             # Base components
│   ├── lib/                # Utilities & configurations
│   ├── services/           # Data fetching services
│   ├── sanity/             # CMS schema & config
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
└── studio-navix/          # Sanity Studio workspace
```

---

## 🎨 **Key Components**

### 🏠 **Homepage Sections**
- **Hero**: Dynamic introduction with call-to-actions
- **Services**: Interactive service showcase
- **Projects**: Animated project portfolio
- **Process**: Step-by-step methodology
- **Testimonials**: Client success stories
- **Contact**: AI-powered contact form

### 📊 **Project Portfolio**
- **Filterable Gallery**: Category and search filters
- **Detailed Case Studies**: In-depth project breakdowns
- **Client Testimonials**: Real feedback and results
- **Live Project Links**: Direct access to completed work

### 🤖 **AI Features**
- **Smart Chat Widget**: Project consultation assistant
- **Recommendation Engine**: Personalized content discovery
- **Multi-language Support**: AI responses in user's language

---

## 🌍 **Internationalization**

Navix supports three languages with full RTL support:

- 🇺🇸 **English** (Default)
- 🇫🇷 **French** 
- 🇸🇦 **Arabic** (RTL)

Language files are located in `public/messages/` and include:
- UI translations
- Content localization
- Cultural adaptations
- Date/number formatting

---

## 🚢 **Deployment**

### Vercel (Recommended)

```bash
# Deploy to Vercel
npm i -g vercel
vercel

# Or use the Vercel CLI
vercel --prod
```

### Manual Deployment

```bash
# Build the project
npm run build

# Start production server
npm start
```

---

## 🧪 **Development Workflow**

### **Content Management**
1. Edit content in Sanity Studio (`/studio`)
2. Content automatically syncs to the website
3. AI features index new content automatically

### **Adding New Features**
1. Create components in `/src/components`
2. Add translations in `/public/messages`
3. Update TypeScript types in `/src/sanity/schemaTypes`

### **AI Content Sync**
```bash
# Extract and process content for AI
npm run extract-content

# Upload to Pinecone vector database
npm run upsert-content
```

---

## 📞 **Contact & Support**

<div align="center">

**Navix Growth Marketing Agency**

📧 **Email**: [contact@navixagency.com](mailto:contact@navixagency.com)  
📱 **Phone**: +216 50 699 724  
🌐 **Website**: [navix.com](https://navix.com)  
📍 **Location**: Manzel Jemil, Bizerte, Tunisia  

---

### 👥 **Meet the Team**

**Houssem Daas** - *Lead Developer*  
📧 [houssemdaas2@gmail.com](mailto:houssemdaas2@gmail.com)  
🔗 [LinkedIn](https://linkedin.com/in/houssem-daas) • [GitHub](https://github.com/HoussemDAAS)

</div>

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the Navix Team**

*Empowering businesses through innovative marketing solutions*

[🔼 Back to Top](#-navix)

</div>
