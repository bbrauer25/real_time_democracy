CREATE TABLE `RTD_role_type`
(
  `id` INT(11) NOT NULL AUTO_INCREMENT
  ,`role_name` VARCHAR(24) NOT NULL
  , PRIMARY KEY (`id`)
  ,UNIQUE KEY `role_name` (`role_name`)
)ENGINE = InnoDB;


CREATE TABLE `RTD_user`
(
`id` INT(11) NOT NULL AUTO_INCREMENT
,`f_name` VARCHAR(24) NOT NULL
,`m_name` VARCHAR(24) NULL
,`l_name` VARCHAR(24) NOT NULL
,`email` VARCHAR(50) NOT NULL
,`address_line_1` VARCHAR(50) NULL
,`address_line_2` VARCHAR(50) NULL
,`address_line_3` VARCHAR(50) NULL
,`role_type_id` INT(11) NOT NULL
,PRIMARY KEY (`id`)
,UNIQUE KEY `email` (`email`)
,FOREIGN KEY (role_type_id) REFERENCES RTD_role_type(id)
)ENGINE = InnoDB;

CREATE TABLE `RTD_password`
(
  `id` INT(11) NOT NULL AUTO_INCREMENT
  ,`user_id` INT(11) NOT NULL
  ,`password` VARCHAR(24) NOT NULL
  ,PRIMARY KEY (`id`)
  ,FOREIGN KEY (user_id) REFERENCES RTD_user(id)
)ENGINE = InnoDB;

CREATE TABLE `RTD_poll`
(
  `id` INT(11) NOT NULL AUTO_INCREMENT
  ,`user_id` INT(11) NOT NULL
  ,`poll` VARCHAR(255) NOT NULL
  ,PRIMARY KEY (`id`)
  ,FOREIGN KEY (user_id) REFERENCES RTD_user(id)
)ENGINE = InnoDB;


CREATE TABLE `RTD_issue`
(
  `id` INT(11) NOT NULL AUTO_INCREMENT
  ,`user_id` INT(11) NOT NULL
  ,`issue` VARCHAR(255) NOT NULL
  ,`title` VARCHAR(50) NULL
  ,PRIMARY KEY (`id`)
  ,FOREIGN KEY (user_id) REFERENCES RTD_user(id)
)ENGINE = InnoDB;


CREATE TABLE `RTD_issue_comment`
(
  `id` INT(11) NOT NULL AUTO_INCREMENT
  ,`user_id` INT(11) NOT NULL
  ,`issue_id` INT(11) NOT NULL
  ,`comment` VARCHAR(255) NOT NULL
  ,PRIMARY KEY (`id`)
  ,FOREIGN KEY (user_id) REFERENCES RTD_user(id)
  ,FOREIGN KEY (issue_id) REFERENCES RTD_issue(id)
)ENGINE = InnoDB;

CREATE TABLE `RTD_issue_upvote`
(
  `id` INT(11) NOT NULL AUTO_INCREMENT
  ,`user_id` INT(11) NOT NULL
  ,`issue_id` INT(11) NOT NULL
  ,`upvote` TINYINT(1) NOT NULL
  ,PRIMARY KEY (`id`)
  ,FOREIGN KEY (user_id) REFERENCES RTD_user(id)
  ,FOREIGN KEY (issue_id) REFERENCES RTD_issue(id)
)ENGINE = InnoDB;


CREATE TABLE `RTD_response_type`
(
  `id` INT(11) NOT NULL AUTO_INCREMENT
  ,`response` VARCHAR(20) NOT NULL
  ,PRIMARY KEY (`id`)
  ,UNIQUE KEY (`response`)
  )ENGINE = InnoDB;



CREATE TABLE `RTD_poll_response`
(
  `id` INT(11) NOT NULL AUTO_INCREMENT
  ,`user_id` INT(11) NOT NULL
  ,`poll_id` INT(11) NOT NULL
  ,`response_type_id` INT(11) NOT NULL
  ,PRIMARY KEY (`id`)
  ,FOREIGN KEY (user_id) REFERENCES RTD_user(id)
  ,FOREIGN KEY (poll_id) REFERENCES RTD_poll(id)
  ,FOREIGN KEY (response_type_id)
    REFERENCES RTD_response_type(id)
)ENGINE = InnoDB;
