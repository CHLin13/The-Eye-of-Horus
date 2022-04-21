-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: localhost    Database: eye
-- ------------------------------------------------------
-- Server version	8.0.28

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
-- Table structure for table `alert`
--

DROP TABLE IF EXISTS `alert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alert` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `source` varchar(256) NOT NULL,
  `select` varchar(10) NOT NULL,
  `condition` varchar(20) NOT NULL,
  `value` bigint NOT NULL,
  `value_max` bigint NOT NULL,
  `eval_every_input` varchar(5) NOT NULL,
  `eval_for_input` varchar(10) NOT NULL,
  `receiver_id` int unsigned NOT NULL,
  `message` varchar(256) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `alert_ibfk_1` (`receiver_id`),
  CONSTRAINT `alert_ibfk_1` FOREIGN KEY (`receiver_id`) REFERENCES `receiver` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alert`
--

LOCK TABLES `alert` WRITE;
/*!40000 ALTER TABLE `alert` DISABLE KEYS */;
INSERT INTO `alert` VALUES (5,'test/host_name','min','above',12,0,'1m','5m',1,'t1'),(6,'test/host_name','min','above',12,0,'1m','5m',1,'t2'),(7,'test/host_name','min','above',500,0,'1m','5m',1,'tttttt'),(8,'test/host_name','min','above',1,0,'1m','5m',1,'11111'),(9,'test/host_name','min','above',222,0,'1m','5m',1,'2222222'),(10,'test/host_name','min','above',123,0,'1m','5m',1,'adfsaef'),(11,'collectd/disk_io_time','min','above',23,0,'1m','5m',1,'asfsaefsa'),(12,'test/host_name','min','above',123,0,'1m','5m',1,'tttt'),(13,'collectd/disk_io_time','min','above',123,0,'1m','5m',1,'afdsdf'),(14,'collectd/disk_io_time','min','above',123,0,'1m','5m',1,'saf'),(15,'test/host_name','min','1',123,0,'1m','5m',1,'adsfsadf'),(16,'collectd/disk_io_time','min','1',123,0,'1m','5m',1,'asdfsadf'),(17,'test/host_name','min','1',999999,0,'1m','5m',1,'asdfsdfsdf');
/*!40000 ALTER TABLE `alert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chart`
--

DROP TABLE IF EXISTS `chart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chart` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `dashboard_id` int unsigned NOT NULL,
  `database` varchar(127) NOT NULL,
  `measurement` varchar(127) NOT NULL,
  `chart_type` char(20) NOT NULL,
  `time_range` varchar(60) NOT NULL,
  `interval` tinyint unsigned NOT NULL,
  `interval_unit` char(1) NOT NULL,
  `select` varchar(10) NOT NULL,
  `layout` varchar(512) DEFAULT NULL,
  `setInterval` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `chart_ibfk_1` (`dashboard_id`),
  CONSTRAINT `chart_ibfk_1` FOREIGN KEY (`dashboard_id`) REFERENCES `dashboard` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chart`
--

LOCK TABLES `chart` WRITE;
/*!40000 ALTER TABLE `chart` DISABLE KEYS */;
INSERT INTO `chart` VALUES (23,1,'collectd','disk_io_time','line','5-m',10,'s','min','{\"title\":\"Server Disk IO\",\"titlefont\":{\"size\":\"20\",\"color\":\"#FFF\"},\"xaxis\":{\"title\":\"Time\",\"titlefont\":{\"size\":\"16\",\"color\":\"#FFF\"},\"tickfont\":{\"size\":\"12\",\"color\":\"#FFF\"}},\"yaxis\":{\"title\":\"IO time\",\"titlefont\":{\"size\":\"16\",\"color\":\"#FFF\"},\"tickfont\":{\"size\":\"12\",\"color\":\"#FFF\"}},\"paper_bgcolor\":\"rgb(52,58,64)\",\"plot_bgcolor\":\"rgba(0,0,0,0)\",\"legend\":{\"font\":{\"color\":\"#FFF\"}}}',10000),(24,1,'collectd','cpu_value','line','5-m',10,'s','min','{\"title\":\"CPU utilization (%)\",\"titlefont\":{\"size\":\"20\",\"color\":\"#FFF\"},\"xaxis\":{\"title\":\"Time\",\"titlefont\":{\"size\":\"16\",\"color\":\"#FFF\"},\"tickfont\":{\"size\":\"12\",\"color\":\"#FFF\"}},\"yaxis\":{\"title\":\"CPU (%)\",\"titlefont\":{\"size\":\"16\",\"color\":\"#FFF\"},\"tickfont\":{\"size\":\"12\",\"color\":\"#FFF\"}},\"paper_bgcolor\":\"rgb(52,58,64)\",\"plot_bgcolor\":\"rgba(0,0,0,0)\",\"legend\":{\"font\":{\"color\":\"#FFF\"}}}',10000),(25,1,'test','host_name','line','5-m',10,'s','min','{\"title\":\"t\",\"titlefont\":{\"size\":\"20\",\"color\":\"#FFF\"},\"xaxis\":{\"title\":\"\",\"titlefont\":{\"size\":\"16\",\"color\":\"#FFF\"},\"tickfont\":{\"size\":\"12\",\"color\":\"#FFF\"}},\"yaxis\":{\"title\":\"\",\"titlefont\":{\"size\":\"16\",\"color\":\"#FFF\"},\"tickfont\":{\"size\":\"12\",\"color\":\"#FFF\"}},\"paper_bgcolor\":\"rgb(52,58,64)\",\"plot_bgcolor\":\"rgba(0,0,0,0)\",\"legend\":{\"font\":{\"color\":\"#FFF\"}}}',10000);
/*!40000 ALTER TABLE `chart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dashboard`
--

DROP TABLE IF EXISTS `dashboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dashboard` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(127) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dashboard`
--

LOCK TABLES `dashboard` WRITE;
/*!40000 ALTER TABLE `dashboard` DISABLE KEYS */;
INSERT INTO `dashboard` VALUES (1,'test');
/*!40000 ALTER TABLE `dashboard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dashboard_permission`
--

DROP TABLE IF EXISTS `dashboard_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dashboard_permission` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `dashboard_id` int unsigned NOT NULL,
  `role_id` smallint unsigned NOT NULL,
  `permission_id` smallint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `dashboard_permission_ibfk_1` (`dashboard_id`),
  KEY `dashboard_permission_ibfk_2` (`role_id`),
  KEY `dashboard_permission_ibfk_3` (`permission_id`),
  CONSTRAINT `dashboard_permission_ibfk_1` FOREIGN KEY (`dashboard_id`) REFERENCES `dashboard` (`id`) ON DELETE CASCADE,
  CONSTRAINT `dashboard_permission_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE,
  CONSTRAINT `dashboard_permission_ibfk_3` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dashboard_permission`
--

LOCK TABLES `dashboard_permission` WRITE;
/*!40000 ALTER TABLE `dashboard_permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `dashboard_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `permission` varchar(127) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receiver`
--

DROP TABLE IF EXISTS `receiver`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receiver` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(128) NOT NULL,
  `type` varchar(20) NOT NULL,
  `detail` varchar(256) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receiver`
--

LOCK TABLES `receiver` WRITE;
/*!40000 ALTER TABLE `receiver` DISABLE KEYS */;
INSERT INTO `receiver` VALUES (1,'test','test','test');
/*!40000 ALTER TABLE `receiver` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` char(60) DEFAULT NULL,
  `name` varchar(127) NOT NULL,
  `admin` char(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'aaa@aaa.aaa','aaa','aaa','1');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_role`
--

DROP TABLE IF EXISTS `user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `role_id` smallint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_role_ibfk_1` (`user_id`),
  KEY `user_role_ibfk_2` (`role_id`),
  CONSTRAINT `user_role_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_role_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_role`
--

LOCK TABLES `user_role` WRITE;
/*!40000 ALTER TABLE `user_role` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_role` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-04-21 21:04:56
