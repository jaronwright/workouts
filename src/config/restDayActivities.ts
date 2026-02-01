export interface RestDayActivity {
  id: string
  name: string
  description: string
  icon: string // Lucide icon name
  duration?: string
  benefits: string[]
}

export const restDayActivities: RestDayActivity[] = [
  {
    id: 'walk',
    name: 'Light Walk',
    description: 'A casual 20-30 minute walk to promote blood flow and recovery.',
    icon: 'footprints',
    duration: '20-30 min',
    benefits: ['Active recovery', 'Reduced muscle soreness', 'Mental clarity']
  },
  {
    id: 'foam-roll',
    name: 'Foam Rolling',
    description: 'Self-myofascial release to reduce muscle tightness and improve mobility.',
    icon: 'circle-dot',
    duration: '10-15 min',
    benefits: ['Reduced muscle tension', 'Improved flexibility', 'Faster recovery']
  },
  {
    id: 'stretch',
    name: 'Gentle Stretching',
    description: 'Light static stretching focusing on tight areas.',
    icon: 'move',
    duration: '10-15 min',
    benefits: ['Increased flexibility', 'Reduced stiffness', 'Relaxation']
  },
  {
    id: 'yoga',
    name: 'Restorative Yoga',
    description: 'Gentle yoga poses with deep breathing for relaxation.',
    icon: 'heart-pulse',
    duration: '20-30 min',
    benefits: ['Stress relief', 'Improved flexibility', 'Mind-body connection']
  },
  {
    id: 'swim',
    name: 'Easy Swimming',
    description: 'Low-intensity swimming or water walking.',
    icon: 'waves',
    duration: '15-20 min',
    benefits: ['Zero impact', 'Full body stretch', 'Cardiovascular health']
  },
  {
    id: 'hydrate',
    name: 'Hydration Focus',
    description: 'Focus on drinking extra water and eating recovery foods.',
    icon: 'droplets',
    benefits: ['Muscle repair', 'Toxin flush', 'Energy restoration']
  },
  {
    id: 'sleep',
    name: 'Extra Sleep',
    description: 'Prioritize an extra 30-60 minutes of sleep for optimal recovery.',
    icon: 'moon',
    duration: '+30-60 min',
    benefits: ['Muscle growth', 'Hormone balance', 'Mental recovery']
  },
  {
    id: 'meditation',
    name: 'Meditation',
    description: 'Practice mindfulness or guided meditation.',
    icon: 'sparkles',
    duration: '10-15 min',
    benefits: ['Stress reduction', 'Mental focus', 'Better sleep quality']
  }
]
