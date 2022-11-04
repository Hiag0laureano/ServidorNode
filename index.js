const express = require('express')

const cors = require('cors')

const mysql = require('mysql2');
const { ifError } = require('assert');

// importação do módulo do jsonwebtoken para nos ajudar
// a trabalhar com seção segura
const jwt = require("jsonwebtoken");
//para criptografar as senhas será utilizado o bcrypt
//vamos importar o módulo
const bcrypt = require("bcrypt");
const res = require('express/lib/response');

const app = express()

app.use(express.json());

app.use(cors());

const connection = mysql.createConnection({
    host : "10.26.45.100",
    user : "root",
    password : "alunos@123",
    database : "petespecial",
    port : "6520"
});connection.connect((error)=>{
    if(error)console.error(error)
});

connection.connect((error)=>{
    if(error){console.error(`Erro ao tentar conectar no banco de dados ->${error}`);
    return;
    }
    console.log(`Servidor do banco de dados conectado ->${connection.threadId}`)
});

app.get("/api/usuario/listar", (req,res)=>{
    connection.query("Select * From Usuario", (erro, result)=>{
        if(erro){
            return res
            .status(400)
            .send({output:`Erro ao tentar carregar dados ->${erro}`});
        }
        res.status(200).send({output:result})
    });
});

app.post("/api/usuario/cadastro", (req, res) => {
    bcrypt.hash(req.body.senha, 10, (erro, result) => {
      if (erro) {
        return res
          .status(503)
          .send({ output: `Erro interno ao gerar a senha ->${erro}` });
      }
      req.body.senha = result;
  
      connection.query("INSERT INTO Usuario SET ?", [req.body], (erro, result) => {
        if (erro) {
          return res
            .status(400)
            .send({ output: `Erro ao tentar cadastrar -> ${erro}` });
        }
        res.status(201).send({ output: `Cadastro realizado`, payload: result });
      });
    });
  });

  app.post("/api/usuario/cadastro", (req, res) => {
    bcrypt.hash(req.body.senha, 10, (erro, result) => {
      if (erro) {
        return res
          .status(503)
          .send({ output: `Erro interno ao gerar a senha ->${erro}` });
      }
      req.body.senha = result;
  
      connection.query("INSERT INTO Usuario SET ?", [req.body], (erro, result) => {
        if (erro) {
          return res
            .status(400)
            .send({ output: `Erro ao tentar cadastrar -> ${erro}` });
        }
        res.status(201).send({ output: `Cadastro realizado`, payload: result });
      });
    });
  });

  app.post("/api/usuario/login", (req, res) => {
    const us = req.body.nomeUsuario;
    const sh = req.body.senha;
  
    connection.query(
      "Select * from Usuario where nomeUsuario=?",
      [us],
      (erro, result) => {
        if (erro) {
      res
            .status(400)
            .send({ output: `Erro ao tentar logar -> ${erro}` });
            return ;
        }
        else if(!result || result.length === 0) {
          res.status(404).send({ output: "Usuário não localizado" });
          return ;
        }
        else{
        console.log(result.length);
        bcrypt.compare(sh, result[0].senha, (erro, igual) => {
          if (erro) {
            return res.status(503).send({ output: `Erro interno->${erro}` });
          }
          else if(!igual) {
            return res.status(400).send({ output: `Sua senha está incorreta` });
          }
          else{
          const token = criarToken(
            result[0].idUsuario,
            result[0].nomeUsuario,
          );
  
          res
            .status(200)
            .send({ output: `Logado`, payload: result, token: token });
        }});
     } }
    );
  });

  app.put("/api/usuario/atualizar/:id", verificar, (req, res) => {
    connection.query(
      "Update Usuario set ? where idUsuario=?",
      [req.body, req.params.id],
      (erro, result) => {
        if (erro) {
          return res
            .status(400)
            .send({ output: `Erro ao tentar atualizar -> ${erro}` });
        }
        res.status(200).send({ output: `Dados atualizados`, payload: result });
      }
    );
  });

  app.post("/api/pet/cadastro", async(req,res)=>{
    connection.query("INSERT INTO Pet SET ?", [req.body], (erro, result) => {
      if (erro) {
        return res
          .status(400)
          .send({ output: `Erro ao tentar cadastrar -> ${erro}` });
      }
      res.status(201).send({ output: `Cadastro realizado`, payload: result });
    });
  });

  app.get("/api/pet/listar", (req,res)=>{
    connection.query("Select * From Pet", (erro, result)=>{
        if(erro){
            return res
            .status(400)
            .send({output:`Erro ao tentar carregar dados ->${erro}`});
        }
        res.status(200).send({output:result})
    });
});

app.delete("/api/pet/apagar/:id", (req, res) => {
  connection.query(
    "Delete from Pet where idPet=?",
    [req.params.id],
    (erro, result) => {
      if (erro) {
        return res
          .status(400)
          .send({ output: `Erro ao tenta apagar->${erro}` });
      }
      res.status(204).send({});
    }
  );
});

app.put("/api/pet/atualizar/:id",(req, res) => {
  connection.query(
    "Update Pet set ? where idPet=?",
    [req.body, req.params.id],
    (erro, result) => {
      if (erro) {
        return res
          .status(400)
          .send({ output: `Erro ao tentar atualizar -> ${erro}` });
      }
      res.status(200).send({ output: `Dados atualizados`, payload: result });
    }
  );
});


app.get("/api/larPet/listar", (req,res)=>{
  connection.query(`Select lp.*, en.bairro,en.cidade,en.estado 
  From LarPet lp inner join Endereco en 
  on lp.idEndereco = en.idEndereco`, (erro, result)=>{
      if(erro){
          return res
          .status(400)
          .send({output:`Erro ao tentar carregar dados ->${erro}`});
      }
      res.status(200).send({output:result})
  });
});

app.post("/api/larPet/cadastro", async(req,res)=>{
  connection.query("INSERT INTO LarPet SET ?", [req.body], (erro, result) => {
    if (erro) {
      return res
        .status(400)
        .send({ output: `Erro ao tentar cadastrar -> ${erro}` });
    }
    res.status(201).send({ output: `Cadastro realizado`, payload: result });
  });
});

app.get("/api/cliente/listar", (req,res)=>{
  connection.query("Select * From Cliente", (erro, result)=>{
      if(erro){
          return res
          .status(400)
          .send({output:`Erro ao tentar carregar dados ->${erro}`});
      }
      res.status(200).send({output:result})
  });
});
  
app.get("/api/cliente/listar/:id", (req,res)=>{
  connection.query(`select cl.idCliente, cl.nomeCliente, cl.foto , 
  en.tipo,
  en.logradouro,
  dp.sexo,
  dp.dataNascimento,
  ct.email, 
  ct.telefoneCelular,
  ct.telefoneResidencial,
  us.nomeUsuario
  From Cliente cl inner join Endereco en on cl.idEndereco = en.idEndereco  
  inner join DadosPessoais dp on cl.idDadosPessoais =  dp.idDadosPessoais
  inner join Contato ct on cl.idContato = ct.idContato 
  inner join Usuario us on cl.idUsuario = us.idUsuario
  where cl.idUsuario = ?`, [req.params.id], (erro, result)=>{
    if(erro){
      return res
      .status(400)
      .send({output:`Erro ao tentar carregar dados ->${erro}`});
  }
  res.status(200).send({output:result})
  })
})

app.get("/", async (req,res)=>{
    res.send("Pagina on");
});

function verificar(req, res, next) {
  const token_enviado = req.headers.token;

  if (!token_enviado) {
    return res.status(401).send({
      output: `Token não existe. 
        Você não tem autorização para acessar esta página`,
    });
  }
  jwt.verify(token_enviado, "senac", (erro, rs) => {
    if (erro) {
      return res.status(503).send({
        output: `Erro no processo de 
            verificação do token->${erro}`,
      });
    }
    return next();
  });
}

function criarToken(id, usuario, email) {
    return jwt.sign({ id: id, usuario: usuario, email: email }, "senac", {
      expiresIn: "2d",
    });
  }


app.listen(3000);
