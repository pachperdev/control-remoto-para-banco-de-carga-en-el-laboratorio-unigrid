// librerias: https://github.com/andresarmento/modbus-arduino
// Repositorio: https://github.com/pachperdev/control-remoto-para-banco-de-carga-en-el-laboratorio-unigrid.git
// Autores del codigo para el control remoto para banco de carga en el laboratorio unigrid: 
// Javier Alberto Rodriguez Rodriguez 
// Mauricio Andres Pacheco Perez
// John Michael Solano Ortiz

#include "Modbus.h"
#include "ModbusSerial.h"

// Modbus Registers Offsets (0-9999)
const int POT1_MB = 3000;
const int POT2_MB = 3001;
const int POT3_MB = 3002;
const int Estado1 = 3010;
const int Estado2 = 3011;
const int Estado3 = 3012;
const int Manual_MB = 3003;
const int VManual_MB = 3013;

// Variables para logica
int POT1_ar;
int POT2_ar;
int POT3_ar;
int estado;
int estado1ant =0;
int estado2ant=0;
int estado3ant=0;
int estadoc;
int Manual_ar=1;
int pot1ant = 0;
int pot2ant = 0;
int pot3ant = 0;

// Used Pins
// Rele banco 1
#define RELE_PIN1A    13
#define RELE_PIN1R    12
#define RELE_PIN1V    11
// Rele banco 2
#define RELE_PIN2A    10
#define RELE_PIN2R    9
#define RELE_PIN2V    8
// Rele banco 3
#define RELE_PIN3A    7
#define RELE_PIN3R    6
#define RELE_PIN3V    5
// led para indicar manual(on-off)
const int ledPIN = 4;

// For reception (RS485 Arduido extension module)
const int En_WrRd_RS485 = 2;

// ModbusSerial object
ModbusSerial mb;

void setup() {
  // Config Modbus Serial (port, speed, byte format, En_WrRd_RS485)
  Serial.begin(9600);
  mb.config(&Serial, 9600, SERIAL_8N1, En_WrRd_RS485);
  // Set the Slave ID (1-247)
  mb.setSlaveId(202);

  pinMode( RELE_PIN1A, OUTPUT );
  pinMode( RELE_PIN1R, OUTPUT );
  pinMode( RELE_PIN1V, OUTPUT );
  pinMode( RELE_PIN2A, OUTPUT );
  pinMode( RELE_PIN2R, OUTPUT );
  pinMode( RELE_PIN2V, OUTPUT );
  pinMode( RELE_PIN3A, OUTPUT );
  pinMode( RELE_PIN3R, OUTPUT );
  pinMode( RELE_PIN3V, OUTPUT );
  pinMode(ledPIN, OUTPUT);
  pinMode(A0,INPUT);
  pinMode(A1,INPUT);
  pinMode(A2,INPUT);
  
  // Lectura de estado
  mb.addHreg(POT1_MB);
  mb.addHreg(POT2_MB);
  mb.addHreg(POT3_MB);
  // Envio de estado
  mb.addHreg(Estado1);
  mb.addHreg(Estado2);
  mb.addHreg(Estado3);
  // Activacion manual
  mb.addHreg(Manual_MB);
  mb.addHreg(VManual_MB);
}

void loop() {
  // Call once inside loop() - all magic here
  mb.task();
  // Obtenemos activacion de protocolo manual desde el scada
  Manual_ar=mb.Hreg(Manual_MB);
  mb.Hreg(VManual_MB,Manual_ar);
  
  // Logica de mb
  estado=mb.Hreg(POT1_MB);
  if (estado != estado1ant){
    estado1ant=estado;
    mb.Hreg(Estado1,estado);
    selectmb(estado,13,12,11);
    delay(200);
  }
  
  estado=mb.Hreg(POT2_MB);
  if (estado != estado2ant){
    estado2ant=estado;
    mb.Hreg(Estado2,estado);
    selectmb(estado,10,9,8);
    delay(200);
  }
  
  estado=mb.Hreg(POT3_MB);
  if (estado != estado3ant){
    estado3ant=estado;
    mb.Hreg(Estado3,estado);
    selectmb(estado,7,6,5);
    delay(200);
  }
  //-----------------------------------------------------
  // logica de potenciometro modo manual activado
  if (Manual_ar==1){

    digitalWrite(ledPIN, HIGH);  
    estado=analogRead(A0);
    estado=convert(estado);
    if (estado != pot1ant){
      pot1ant=estado;
      selectmb(estado,13,12,11);
      mb.Hreg(Estado1,estado);
      delay(200);
    }
    
    estado=analogRead(A1);
    estado=convert(estado);
    if (estado != pot2ant){
      pot2ant=estado;
      selectmb(estado,10,9,8);
      mb.Hreg(Estado2,estado);
      delay(200);
    }

    estado=analogRead(A2);
    estado=convert(estado);
    if (estado != pot3ant){
      pot3ant=estado;
      selectmb(estado,7,6,5);
      mb.Hreg(Estado3,estado);
      delay(200);
    }
   
  }else{
    digitalWrite(ledPIN, LOW);  
    }
  
}
// funcion que seleciona las 6 posiciones que contiene la perilla
void selectmb(int valormb,int pinamb,int pinrmb,int pinvmb){
  if (valormb ==0){
   //Apagado
  digitalWrite(pinamb, LOW);  
  digitalWrite(pinrmb, LOW); 
  digitalWrite(pinvmb, LOW);
  } else if (valormb ==1) {
  // Primer estado
  digitalWrite(pinamb, HIGH);  
  digitalWrite(pinrmb, HIGH); 
  digitalWrite(pinvmb, HIGH);
  } else if (valormb ==2) {
  //Segundo estado
  digitalWrite(pinamb, LOW);  
  digitalWrite(pinrmb, HIGH); 
  digitalWrite(pinvmb, HIGH);
  } else if (valormb ==3) {
  // Tercer estado
  digitalWrite(pinamb, LOW);  
  digitalWrite(pinrmb, HIGH); 
  digitalWrite(pinvmb, LOW);
  } else if (valormb ==4) {
  // cuarto estado
  digitalWrite(pinamb, HIGH);  
  digitalWrite(pinrmb, LOW); 
  digitalWrite(pinvmb, HIGH);
  } else if (valormb ==5) {
  // quinto estado
  digitalWrite(pinamb, LOW);  
  digitalWrite(pinrmb, LOW); 
  digitalWrite(pinvmb, HIGH);
  } else if (valormb ==6) {
  // sexto estado
  digitalWrite(pinamb, HIGH);  
  digitalWrite(pinrmb, LOW); 
  digitalWrite(pinvmb, LOW);
  } 
}
// funcion que convierte el rango del potenciometro(0 - 1024) a valores entre(0 - 6)
int convert(int valor){
  int estadoconver;
  if (valor <=156){
    estadoconver=0;
  } else if (valor <=319) {
    estadoconver=1;
  } else if (valor <=468) {
    estadoconver=2;
  } else if (valor <=612) {
    estadoconver=3;
  } else if (valor <=748) {
    estadoconver=4;
  } else if (valor <=892) {
    estadoconver=5;
  } else if (valor >=987) {
    estadoconver=6;
  }
  return estadoconver;
}
