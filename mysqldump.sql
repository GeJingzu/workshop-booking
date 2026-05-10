-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: workshop_booking
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `workshop_booking`
--

/*!40000 DROP DATABASE IF EXISTS `workshop_booking`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `workshop_booking` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `workshop_booking`;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `attendee_id` int NOT NULL,
  `status` enum('confirmed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'confirmed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_event_attendee` (`event_id`,`attendee_id`),
  KEY `attendee_id` (`attendee_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`attendee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,1,5,'confirmed','2026-05-09 11:00:00'),(2,2,4,'confirmed','2026-05-09 11:00:00'),(3,2,5,'confirmed','2026-05-09 11:00:00'),(4,3,4,'confirmed','2026-05-09 11:00:00'),(5,3,6,'confirmed','2026-05-09 11:00:00'),(6,6,6,'confirmed','2026-05-09 11:00:00');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `organiser_id` int NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `location` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_date` datetime NOT NULL,
  `capacity` int NOT NULL DEFAULT '20',
  `price` decimal(8,2) NOT NULL DEFAULT '0.00',
  `status` enum('open','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `organiser_id` (`organiser_id`),
  KEY `idx_events_date` (`event_date`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`organiser_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,3,'Cooking Class','Cook a simple meal in a small group.','Kitchen B, Dublin 6','2026-05-14 17:00:00',8,40.00,'open','2026-05-09 11:00:00'),(2,2,'Yoga Class','One-hour yoga session for beginners.','Room 1, Dublin 2','2026-05-16 17:00:00',20,15.00,'open','2026-05-09 11:00:00'),(3,3,'JS Workshop','Basic JavaScript workshop for new learners.','Lab 2, Dublin 1','2026-05-19 08:00:00',30,50.00,'open','2026-05-09 11:00:00'),(4,2,'Painting Class','Relaxing painting class for beginners.','Room 3, Dublin 4','2026-05-23 09:00:00',12,25.00,'open','2026-05-09 11:00:00'),(5,2,'Photo Walk','Outdoor photo walk around Dublin city centre.','City Centre, Dublin','2026-05-30 13:00:00',15,20.00,'open','2026-05-09 11:00:00'),(6,3,'Dance Class','Beginner dance moves, no experience needed.','Hall A, Dublin 8','2026-05-27 16:00:00',20,30.00,'open','2026-05-09 11:00:00');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('organiser','attendee','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'attendee',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Jingzu Ge','jingzu@workshop.com','$2b$10$iBJtI00koMgo4p1Zd9UEmOAvvUYnYrAh.rDzFNdKehA1WHwFFsdQq','admin','2026-05-09 11:00:00'),(2,'Jikun Li','jikun@workshop.com','$2b$10$iBJtI00koMgo4p1Zd9UEmOAvvUYnYrAh.rDzFNdKehA1WHwFFsdQq','organiser','2026-05-09 11:00:00'),(3,'A','a@workshop.com','$2b$10$iBJtI00koMgo4p1Zd9UEmOAvvUYnYrAh.rDzFNdKehA1WHwFFsdQq','organiser','2026-05-09 11:00:00'),(4,'abcd','abcd@workshop.com','$2b$10$iBJtI00koMgo4p1Zd9UEmOAvvUYnYrAh.rDzFNdKehA1WHwFFsdQq','attendee','2026-05-09 11:00:00'),(5,'B','b@workshop.com','$2b$10$iBJtI00koMgo4p1Zd9UEmOAvvUYnYrAh.rDzFNdKehA1WHwFFsdQq','attendee','2026-05-09 11:00:00'),(6,'C','c@workshop.com','$2b$10$iBJtI00koMgo4p1Zd9UEmOAvvUYnYrAh.rDzFNdKehA1WHwFFsdQq','attendee','2026-05-09 11:00:00');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-10  0:55:30
