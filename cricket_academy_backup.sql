mysqldump.exe : mysqldump: [Warning] Using 
a password on the command line interface 
can be insecure.
At C:\Users\uditha\Desktop\New folder 
(2)\project\export_database.ps1:33 char:1
+ & $mysqldumpPath -u $user -p"$password" 
-P $port --host=$dbHost --def ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified 
   : (mysqldump: [War...an be insecure.:S  
  tring) [], RemoteException
    + FullyQualifiedErrorId : NativeComman 
   dError
 
-- MySQL dump 10.13  Distrib 8.0.39, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: cricket_academy_db
-- ------------------------------------------------------
-- Server version	8.0.39

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
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` varchar(36) NOT NULL,
  `bookingDate` datetime NOT NULL,
  `startTime` varchar(255) NOT NULL,
  `duration` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `user_id` varchar(36) DEFAULT NULL,
  `facility_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_64cd97487c5c42806458ab5520c` (`user_id`),
  KEY `FK_e90f37d4783fd625fb06b642fe9` (`facility_id`),
  CONSTRAINT `FK_64cd97487c5c42806458ab5520c` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_e90f37d4783fd625fb06b642fe9` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facilities`
--

DROP TABLE IF EXISTS `facilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facilities` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('net','bowling_machine','pitch','gym','other') NOT NULL DEFAULT 'net',
  `pricePerHour` decimal(10,2) NOT NULL,
  `description` text,
  `imageUrl` varchar(255) DEFAULT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facilities`
--

LOCK TABLES `facilities` WRITE;
/*!40000 ALTER TABLE `facilities` DISABLE KEYS */;
/*!40000 ALTER TABLE `facilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` varchar(36) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` enum('cash','card','online') NOT NULL,
  `status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  `transactionId` varchar(255) DEFAULT NULL,
  `paymentDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `bookingId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_1ead3dc5d71db0ea822706e389` (`bookingId`),
  CONSTRAINT `FK_1ead3dc5d71db0ea822706e389d` FOREIGN KEY (`bookingId`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `role` enum('admin','coach','player','guest') NOT NULL DEFAULT 'guest',
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `avatar` varchar(255) DEFAULT NULL,
  `battingStyle` varchar(255) DEFAULT NULL,
  `bowlingStyle` varchar(255) DEFAULT NULL,
  `totalBookings` int NOT NULL DEFAULT '0',
  `totalSpent` decimal(10,2) NOT NULL DEFAULT '0.00',
  `joinDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `password` varchar(255) NOT NULL,
  `isVerified` tinyint NOT NULL DEFAULT '0',
  `verificationToken` varchar(255) DEFAULT NULL,
  `resetPasswordToken` varchar(255) DEFAULT NULL,
  `resetPasswordExpires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('03524879-8626-4a20-8e5a-459260aae0da','Uditha Sandeepa','udithasandeepa8@gmail.com','+94766284928','admin','Active',NULL,NULL,NULL,0,0.00,'2026-01-26 14:48:31.967379','2026-01-26 14:49:07.000000','$2b$10$s.xjHl7USa1aDjWOuZg/QuUnqTu2cSt0os/hVGx9od0XgRlPhYM4C',1,'',NULL,NULL),('946f40fe-fada-4693-9ed2-247c344f8c2e','Buddhika Bandara','bandarabuddhika2@gmail.com','+94766284928','player','Active',NULL,NULL,NULL,0,0.00,'2026-01-26 20:51:38.820446','2026-01-26 20:52:11.000000','$2b$10$nxM5SdJ2Nma76XM3NkGSVe/SFY2cc.aIiyjdlD0.Z3VntOCdHeVuy',1,'',NULL,NULL),('999fc50a-6ff7-46da-bedd-fbedbb16949d','Lavindi Tharunya','mpltharunya22@gmail.com','0766284928','player','Active',NULL,NULL,NULL,0,0.00,'2026-01-26 20:20:35.675835','2026-01-26 20:21:57.000000','$2b$10$1t/U5oREtRnCsMV7Y67J2Olk03BJ3aL03w2fq7KU2oxjKmxYTre86',1,'',NULL,NULL);
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

-- Dump completed on 2026-01-27 19:44:58
