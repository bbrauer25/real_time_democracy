DROP TABLE IF EXISTS `RTD_poll_response`;
DROP TABLE IF EXISTS `RTD_response_type`;
DROP TABLE IF EXISTS `RTD_poll`;
DROP TABLE IF EXISTS `RTD_issue_comment`;
DROP TABLE IF EXISTS `RTD_issue_upvote`;
DROP TABLE IF EXISTS `RTD_issue`;
DROP TABLE IF EXISTS `RTD_password`;
DROP TABLE IF EXISTS `RTD_user`;
DROP TABLE IF EXISTS `RTD_role_type`;

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
,`l_name` VARCHAR(24) NOT NULL
,`email` VARCHAR(50) NOT NULL
,`zip` VARCHAR(10) NOT NULL
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



INSERT INTO `RTD_role_type`(role_name)
 VALUES
 ("constituent"
 );
 INSERT INTO `RTD_role_type`(role_name)
 VALUES
 ("elected"
 );
 
 SELECT COUNT(*) FROM `RTD_role_type`;

 INSERT INTO `RTD_user`(`f_name`, `l_name`, `email`, `zip`, `role_type_id`)
VALUES
("Mildred"
, "Lee"
, "milly.lee@asdf.com"
, "64050"
,(SELECT id FROM RTD_role_type WHERE role_name ='constituent')
 );
 
  INSERT INTO `RTD_user`(`f_name`, `l_name`, `email`, `zip`, `role_type_id`)
VALUES
("Jane"
, "Doe"
, "jane.doe@123.com"
, "64050"
,(SELECT id FROM RTD_role_type WHERE role_name ='constituent')
 );
 

 INSERT INTO `RTD_user`(`f_name`, `l_name`, `email`, `zip`, `role_type_id`)
VALUES
("Barack"
, "Obama"
, "obama@whitehouse.gov"
, "20500"
,(SELECT id FROM RTD_role_type WHERE role_name ='elected')
 );

INSERT INTO `RTD_password` (`user_id`, `password`)
VALUES
((SELECT id FROM RTD_user WHERE email = 'obama@whitehouse.gov')
,"president"
);

INSERT INTO `RTD_password` (`user_id`, `password`)
VALUES
((SELECT id FROM RTD_user WHERE email = 'milly.lee@asdf.com')
,"abcde"
);

INSERT INTO `RTD_password` (`user_id`, `password`)
VALUES
((SELECT id FROM RTD_user WHERE email = 'jane.doe@123.com')
,"password"
);

SELECT COUNT(*) FROM `RTD_user` AS U 
INNER JOIN `RTD_password` AS P
on U.id = P.user_id;

INSERT INTO `RTD_poll`(`user_id`, `poll`)
 VALUES
 ((SELECT id FROM RTD_user WHERE email ='obama@whitehouse.gov')
 ,"Should I vote yes on HB. 122 titled 'Han shot first'?"
 );
 
INSERT INTO `RTD_issue`(`user_id`, `issue`,`title`)
 VALUES
 ((SELECT id from RTD_user WHERE email = 'milly.lee@asdf.com')
 ,"We really need a deathstar. You never know when one will come in handy."
 ,"Why hasn't the government built a death star yet."
 );

#in production instead of the select query for the title it would use the value from a hidden field that had stored the issue id

INSERT INTO `RTD_issue_comment`(`user_id`, `issue_id`, `comment`)
VALUES
((SELECT  id FROM RTD_user WHERE email='obama@whitehouse.gov')
,(SELECT id FROM RTD_issue WHERE title = "Why hasn't the government built a death star yet." )
,"Building a death star is not economocally feasible at this time. Love the idea and would love to see one built."
);

INSERT INTO `RTD_issue_upvote`(`user_id`, `issue_id`,`upvote`)
VALUES
((SELECT id from RTD_user WHERE email = 'milly.lee@asdf.com')
,(SELECT id FROM RTD_issue WHERE title = "Why hasn't the government built a death star yet.")
,"1"
);

INSERT INTO `RTD_response_type`(`response`)
VALUES
("yes");

INSERT INTO `RTD_response_type`(`response`)
VALUES
("no");

INSERT INTO `RTD_poll_response` (`user_id`, `poll_id`, `response_type_id`)
VALUES
((SELECT  id FROM RTD_user WHERE email='obama@whitehouse.gov')
, (SELECT id FROM RTD_poll WHERE poll = "Should I vote yes on HB. 122 titled 'Han shot first'?")
,(SELECT id FROm RTD_response_type WHERE response='yes')
);


SELECT COUNT(*) FROM `RTD_poll_response` AS P
INNER JOIN `RTD_poll` AS PP
ON PP.id = P.poll_id
INNER JOIN `RTD_response_type` AS RT
ON RT.id = P.response_type_id
INNER JOIN `RTD_user` AS U
ON U.id = P.user_id;


