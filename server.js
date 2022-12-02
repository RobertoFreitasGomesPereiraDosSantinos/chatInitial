const express = require("express");
const fs = require("fs");
const app = express();
const http = require("http").Server(app);
const serv_sockt = require("socket.io")(http);
const porta = process.env.PORT || 8080;

let historico = [];
let usuarios = [];

app.use(express.static("publico"));

http.listen(porta, function () {
  console.log("deu certo");
});

app.get("/", function (req, resp) {
  fs.readFile(__dirname + "/index.html", function (err, data) {
    if (err) {
      return resp.end("falha ao carregar arquivo");
    }
    resp.end(data);
  });
});

serv_sockt.on("connection", function (socket) {
  socket.on("login", function (apelido, callback) {
    if (!(apelido.nick in usuarios)) {
      socket.nickname = apelido.nick;
      usuarios[apelido.nick] = socket;
      /*
      da pra usar um forEach pra percorrer a array usuarios
      e usar o id do objeto, pra saber quais pessoas estão
      num projeto, e da um emit todos os users com id´s iguais
      assim sempre será menssagens privadas
      */
      historico.forEach(function (dados) {
        socket.emit("chat", dados);
      });
      const msg_form = {
        msg: `[${pegarDataAtual()}]${apelido.nick} acabou de entrar na sala`,
        tipo: "sistema",
      };
      _saveMsg_(msg_form);
      serv_sockt.emit("atualizar usuarios", Object.keys(usuarios));
      socket.broadcast.emit("chat", msg_form);
      callback(true);
    } else {
      callback(false);
    }
  });

  socket.on("chat", function (dados) {
    let mesg = dados.msg;
    let usr = dados.usu;
    mesg = `[${socket.nickname} ${pegarDataAtual()}]: ${mesg}`;
    if (usr == null) {
      usr = "";
    }
    if (usr == "") {
      const msg_form = {
        msg: mesg,
        tipo: "",
      };
      _saveMsg_(msg_form);
      serv_sockt.emit("chat", msg_form);
    } else {
      const msg_form = {
        msg: mesg,
        tipo: "privada",
      };
      socket.emit("chat", msg_form);
      usuarios[usr].emit("chat", msg_form);
    }
  });

  socket.on("disconnect", function () {
    delete usuarios[socket.nickname];
    const msg_form = {
      msg: `[${pegarDataAtual()}]${socket.nickname} saiu da sala`,
      tipo: "sistema",
    };
    _saveMsg_(msg_form);
    serv_sockt.emit("atualizar usuarios", Object.keys(usuarios));
    serv_sockt.emit("chat", msg_form);
  });

  function pegarDataAtual() {
    var dataAtual = new Date();
    var hora = (dataAtual.getHours() < 10 ? "0" : "") + dataAtual.getHours();
    var minuto =
      (dataAtual.getMinutes() < 10 ? "0" : "") + dataAtual.getMinutes();
    var dataFormatada = hora + ":" + minuto;
    return dataFormatada;
  }

  _saveMsg_ = (neo_msg) => {
    historico.push(neo_msg);
  };
});
