// CardGrid.tsx
import React from 'react'
import Card from './Card'
import styles from './CardGrid.module.css'

const cards = [
  {
    image: '/img/home/cluster.gif',
    title: 'Indra Nooyi and Lisa Kassenaar',
    description: 'Indra Nooyi and Lisa Kassenaar discuss her book...',
  },
  {
    image: '/img/home/forestlang2.jpg',
    title: 'Indra with Professor Modupe Akinola',
    description: 'Indra poses with Professor Modupe Akinola...',
  },
  {
    image: '/img/home/cluster.gif',
    title: 'Indra Nooyi and Lisa Kassenaar',
    description: 'Indra Nooyi and Lisa Kassenaar discuss her book...',
  },
  {
    image: '/img/home/forestlang2.jpg',
    title: 'Indra with Professor Modupe Akinola',
    description: 'Indra poses with Professor Modupe Akinola...',
  },
  {
    image: '/img/home/cluster.gif',
    title: 'Indra Nooyi and Lisa Kassenaar',
    description: 'Indra Nooyi and Lisa Kassenaar discuss her book...',
  },
  {
    image: '/img/home/forestlang2.jpg',
    title: 'Indra with Professor Modupe Akinola',
    description: 'Indra poses with Professor Modupe Akinola...',
  },
  {
    image: '/img/home/cluster.gif',
    title: 'Indra Nooyi and Lisa Kassenaar',
    description: 'Indra Nooyi and Lisa Kassenaar discuss her book...',
  },
  {
    image: '/img/home/forestlang2.jpg',
    title: 'Indra with Professor Modupe Akinola',
    description: 'Indra poses with Professor Modupe Akinola...',
  },
  {
    image: '/img/home/cluster.gif',
    title: 'Indra Nooyi and Lisa Kassenaar',
    description: 'Indra Nooyi and Lisa Kassenaar discuss her book...',
  },
  {
    image: '/img/home/forestlang2.jpg',
    title: 'Indra with Professor Modupe Akinola',
    description: 'Indra poses with Professor Modupe Akinola...',
  },
  {
    image: '/img/home/cluster.gif',
    title: 'Indra Nooyi and Lisa Kassenaar',
    description: 'Indra Nooyi and Lisa Kassenaar discuss her book...',
  },
  {
    image: '/img/home/forestlang2.jpg',
    title: 'Indra with Professor Modupe Akinola',
    description: 'Indra poses with Professor Modupe Akinola...',
  },
  // Add more cards here based on your data
]

const CardGrid: React.FC = () => {
  return (
    <div className={styles.grid}>
      {cards.map((card, index) => (
        <Card key={index} image={card.image} title={card.title} description={card.description} />
      ))}
    </div>
  )
}

export default CardGrid
