// Card.tsx
import React from 'react'
import styles from './Card.module.css' // Import the CSS module for styling

type CardProps = {
  image: string
  title: string
  description: string
}

const Card: React.FC<CardProps> = ({ image, title, description }) => {
  return (
    <div className={styles.card}>
      <img src={image} alt={title} className={styles.image} />
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  )
}

export default Card
