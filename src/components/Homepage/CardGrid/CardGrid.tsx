// CardGrid.tsx
import React from 'react'
import Card from './Card'
import styles from './CardGrid.module.css'

const cards = [
  {
    image: '/party_gifs/bird-0199.gif',
    title: 'Indra Nooyi and Lisa Kassenaar',
    description: 'Indra Nooyi and Lisa Kassenaar discuss her book...',
  },
  {
    image: '/img/home/forestlang2.jpg',
    title: 'Indra with Professor Modupe Akinola',
    description: 'Indra poses with Professor Modupe Akinola...',
  },
  {
    image: '/party_gifs/bird-0333.gif',
    title: 'Indra Nooyi and Lisa Kassenaar',
    description: 'Indra Nooyi and Lisa Kassenaar discuss her book...',
  },
  {
    image: '/img/home/forestlang2.jpg',
    title: 'Indra with Professor Modupe Akinola',
    description: 'Indra poses with Professor Modupe Akinola...',
  },
  {
    image: '/party_gifs/i-22899.gif',
    title: 'Indra Nooyi and Lisa Kassenaar',
    description: 'Indra Nooyi and Lisa Kassenaar discuss her book...',
  },
  {
    image: '/img/home/forestlang2.jpg',
    title: 'Indra with Professor Modupe Akinola',
    description: 'Indra poses with Professor Modupe Akinola...',
  },
  {
    image: '/party_gifs/i-37830.gif',
    title: 'Indra Nooyi and Lisa Kassenaar',
    description: 'Indra Nooyi and Lisa Kassenaar discuss her book...',
  },
  {
    image: '/img/home/forestlang2.jpg',
    title: 'Indra with Professor Modupe Akinola',
    description: 'Indra poses with Professor Modupe Akinola...',
  },
  {
    image: '/party_gifs/i-47893.gif',
    title: 'Indra Nooyi and Lisa Kassenaar',
    description: 'Indra Nooyi and Lisa Kassenaar discuss her book...',
  },
  {
    image: '/img/home/forestlang2.jpg',
    title: 'Indra with Professor Modupe Akinola',
    description: 'Indra poses with Professor Modupe Akinola...',
  },
  {
    image: '/party_gifs/i-49995.gif',
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
