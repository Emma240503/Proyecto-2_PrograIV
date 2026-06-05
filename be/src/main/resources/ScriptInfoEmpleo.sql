-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema infoempleo
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema infoempleo
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `infoempleo` DEFAULT CHARACTER SET utf8 ;
USE `infoempleo` ;

-- -----------------------------------------------------
-- Table `infoempleo`.`Empresa`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `infoempleo`.`Empresa` ;

CREATE TABLE IF NOT EXISTS `infoempleo`.`Empresa` (
  `id` VARCHAR(160) NOT NULL,
  `correo` VARCHAR(45) NULL,
  `descripcion` VARCHAR(255) NULL,
  `nombre` VARCHAR(45) NULL,
  `ubicacion` VARCHAR(120) NULL,
  `telefono` INT NULL,
  `contrasenna` VARCHAR(255) NULL,
  `estado` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `infoempleo`.`Admin`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `infoempleo`.`Admin` ;

CREATE TABLE IF NOT EXISTS `infoempleo`.`Admin` (
  `id` VARCHAR(160) NOT NULL,
  `correo` VARCHAR(45) NULL,
  `nombre` VARCHAR(45) NULL,
  `descripcion` VARCHAR(255) NULL,
  `telefono` INT NULL,
  `contrasenna` VARCHAR(255) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `infoempleo`.`Caracteristica`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `infoempleo`.`Caracteristica` ;

CREATE TABLE IF NOT EXISTS `infoempleo`.`Caracteristica` (
  `caracteristica_id` VARCHAR(160) NOT NULL,
  `descripcion` VARCHAR(255) NULL,
  `nombre` VARCHAR(45) NULL,
  `padre_id` VARCHAR(160) NULL,
  PRIMARY KEY (`caracteristica_id`),
  INDEX `fk_Caracteristica_Caracteristica_idx` (`padre_id` ASC) VISIBLE,
  CONSTRAINT `fk_Caracteristica_Caracteristica`
    FOREIGN KEY (`padre_id`)
    REFERENCES `infoempleo`.`Caracteristica` (`caracteristica_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `infoempleo`.`Oferente`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `infoempleo`.`Oferente` ;

CREATE TABLE IF NOT EXISTS `infoempleo`.`Oferente` (
  `id` VARCHAR(160) NOT NULL,
  `correo` VARCHAR(45) NULL,
  `nombre` VARCHAR(45) NULL,
  `primerApellido` VARCHAR(45) NULL,
  `ubicacion` VARCHAR(45) NULL,
  `nacionalidad` VARCHAR(45) NULL,
  `telefono` INT NULL,
  `contrasenna` VARCHAR(255) NULL,
  `curriculum` VARCHAR(255) NULL,
  `estado` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `infoempleo`.`Oferente_has_Caracteristica`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `infoempleo`.`Oferente_has_Caracteristica` ;

CREATE TABLE IF NOT EXISTS `infoempleo`.`Oferente_has_Caracteristica` (
  `Oferente_id` VARCHAR(160) NULL,
  `Caracteristica_caracteristica_id` VARCHAR(160) NULL,
  `id` VARCHAR(255) NOT NULL,
  `nivel` INT NULL,
  INDEX `fk_Oferente_has_Caracteristica_Caracteristica1_idx` (`Caracteristica_caracteristica_id` ASC) VISIBLE,
  INDEX `fk_Oferente_has_Caracteristica_Oferente1_idx` (`Oferente_id` ASC) VISIBLE,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_Oferente_has_Caracteristica_Oferente1`
    FOREIGN KEY (`Oferente_id`)
    REFERENCES `infoempleo`.`Oferente` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Oferente_has_Caracteristica_Caracteristica1`
    FOREIGN KEY (`Caracteristica_caracteristica_id`)
    REFERENCES `infoempleo`.`Caracteristica` (`caracteristica_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `infoempleo`.`Puesto`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `infoempleo`.`Puesto` ;

CREATE TABLE IF NOT EXISTS `infoempleo`.`Puesto` (
  `id` VARCHAR(255) NOT NULL,
  `descripcion` VARCHAR(45) NULL,
  `salario` VARCHAR(45) NULL,
  `activo` TINYINT NULL,
  `Empresa_id` VARCHAR(160) NOT NULL,
  `fecha_registro` DATETIME NULL,
  `tipo` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Puesto_Empresa1_idx` (`Empresa_id` ASC) VISIBLE,
  CONSTRAINT `fk_Puesto_Empresa1`
    FOREIGN KEY (`Empresa_id`)
    REFERENCES `infoempleo`.`Empresa` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `infoempleo`.`Puesto_has_Caracteristica`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `infoempleo`.`Puesto_has_Caracteristica` ;

CREATE TABLE IF NOT EXISTS `infoempleo`.`Puesto_has_Caracteristica` (
  `Puesto_id` VARCHAR(255) NOT NULL,
  `Caracteristica_caracteristica_id` VARCHAR(160) NOT NULL,
  `nivel` INT NULL,
  INDEX `fk_Puesto_has_Caracteristica_Caracteristica1_idx` (`Caracteristica_caracteristica_id` ASC) VISIBLE,
  INDEX `fk_Puesto_has_Caracteristica_Puesto1_idx` (`Puesto_id` ASC) VISIBLE,
  PRIMARY KEY (`Puesto_id`, `Caracteristica_caracteristica_id`),
  CONSTRAINT `fk_Puesto_has_Caracteristica_Puesto1`
    FOREIGN KEY (`Puesto_id`)
    REFERENCES `infoempleo`.`Puesto` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Puesto_has_Caracteristica_Caracteristica1`
    FOREIGN KEY (`Caracteristica_caracteristica_id`)
    REFERENCES `infoempleo`.`Caracteristica` (`caracteristica_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;



-- Admin por defecto
INSERT INTO `infoempleo`.`Admin`
(`id`, `correo`, `nombre`, `descripcion`, `telefono`, `contrasenna`)
VALUES
    ('admin1', 'admin@bolsaempleo.local', 'Administrador', 'Admin del sistema', 0, '1');


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
