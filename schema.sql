-- --------------------------------------------------------
-- Host:                         us-cdbr-iron-east-01.cleardb.net
-- Server version:               5.5.56-log - MySQL Community Server (GPL)
-- Server OS:                    Linux
-- HeidiSQL Version:             9.5.0.5196
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for heroku_cdc4ca7b10e1680
CREATE DATABASE IF NOT EXISTS `heroku_cdc4ca7b10e1680` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `heroku_cdc4ca7b10e1680`;

-- Dumping structure for table heroku_cdc4ca7b10e1680.accounts
CREATE TABLE IF NOT EXISTS `accounts` (
  `username` tinytext,
  `password` tinytext,
  `content` tinytext,
  `description` text,
  `upvotes` int(11) DEFAULT '0',
  `downvotes` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table heroku_cdc4ca7b10e1680.comments
CREATE TABLE IF NOT EXISTS `comments` (
  `post_id` text,
  `user_id` text,
  `text` varchar(50) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `upvotes` int(11) DEFAULT '0',
  `downvotes` int(11) DEFAULT '0',
  `replies` int(11) unsigned DEFAULT '0',
  `comment_id` text,
  `parent_comment_id` text,
  `comment_level` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table heroku_cdc4ca7b10e1680.comment_votes
CREATE TABLE IF NOT EXISTS `comment_votes` (
  `comment_id` text,
  `user_id` text,
  `vote_state` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table heroku_cdc4ca7b10e1680.follows
CREATE TABLE IF NOT EXISTS `follows` (
  `Timestamp` bigint(20) DEFAULT NULL,
  `user_id` text,
  `followee_id` text,
  `priority` double DEFAULT NULL,
  `type` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table heroku_cdc4ca7b10e1680.global_posts
CREATE TABLE IF NOT EXISTS `global_posts` (
  `post_id` text,
  `song` text,
  `timestamp` bigint(20) DEFAULT NULL,
  `relevant_timestamp` double DEFAULT NULL,
  `likes` int(11) DEFAULT NULL,
  `embedded_content` text,
  `content` text,
  `album` text,
  `type` int(11) DEFAULT NULL,
  `artist` text,
  `dislikes` int(11) NOT NULL DEFAULT '0',
  `release_date` text,
  `data` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table heroku_cdc4ca7b10e1680.likes
CREATE TABLE IF NOT EXISTS `likes` (
  `post_id` text,
  `user_id` text,
  `like_state` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table heroku_cdc4ca7b10e1680.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table heroku_cdc4ca7b10e1680.user_content
CREATE TABLE IF NOT EXISTS `user_content` (
  `id` text,
  `username` text,
  `embedded_content` text,
  `content` text,
  `timestamp` bigint(20) DEFAULT NULL,
  `likes` int(11) unsigned DEFAULT NULL,
  `dislikes` int(11) unsigned DEFAULT NULL,
  `post_id` text,
  `title` text,
  `artist` text,
  `album` text,
  `song` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
