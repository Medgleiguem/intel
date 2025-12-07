import Home from '../views/Home.vue'
import Chat from '../views/Chat.vue'
import Services from '../views/Services.vue'
import Documents from '../views/Documents.vue'
import Procedures from '../views/Procedures.vue'
import About from '../views/About.vue'
import Offline from '../views/Offline.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Moussadar - Accueil',
      description: 'Assistant intelligent pour services publics numériques'
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: {
      title: 'Chat Assistant',
      description: 'Discutez avec notre assistant IA'
    }
  },
  {
    path: '/services',
    name: 'Services',
    component: Services,
    meta: {
      title: 'Services Publics',
      description: 'Accédez aux services publics numériques'
    }
  },
  {
    path: '/documents',
    name: 'Documents',
    component: Documents,
    meta: {
      title: 'Documents',
      description: 'Gérez vos documents administratifs'
    }
  },
  {
    path: '/procedures',
    name: 'Procedures',
    component: Procedures,
    meta: {
      title: 'Procédures',
      description: 'Guide des démarches administratives'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: 'À propos',
      description: 'En savoir plus sur Moussadar'
    }
  },
  {
    path: '/offline',
    name: 'Offline',
    component: Offline,
    meta: {
      title: 'Hors ligne',
      description: 'Mode hors ligne'
    }
  }
]

export default routes