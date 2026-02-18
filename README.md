# Solidarify

# Recordar cambiar a 

ALTER TABLE Propuesta 
ADD COLUMN Id_Ong INT NULL;

ALTER TABLE Propuesta 
ADD CONSTRAINT fk_Propuesta_Ong 
FOREIGN KEY (Id_Ong) REFERENCES PerfilONG(Id_Usuario) 
ON DELETE SET NULL 
ON UPDATE CASCADE;
