$(function () {
  const socket = io();
  /*
  daqui faz o evento de login pegando o value de do input
  contendo o nome do usuario e o id do projeto
  */
  $("#login").submit(function (evt) {
    socket.emit("login", {nick:$("#apelido").val(), id:123}, function (valido) {
      console.log("exatao");
      console.log("e é" + valido);
      if (valido) {
        $("#acesso_usuario").hide();
        $("#sala_chat").show();
      } else {
        $("#acesso_usuario").val("");
        alert("Nome já utilizado nesta sala");
      }
    });
    return false;
  });
  $("#form").submit(function (evt) {
    let mens = $("#msg").val();
    let user = $("#lista_usuarios").val();
    socket.emit("chat", { msg: mens, usu: user });
    $("#msg").val("");

    return false;
  });

  socket.on("chat", function (dado) {
    let neo_msg = $("<p />").text(dado.msg).addClass(dado.tipo);
    $("#historico_mensagens").append(neo_msg);
  });

  socket.on("atualizar usuarios", function (usuarios) {
    if (!usuarios.length) {
      $("#historico_mensagens").empty();
    }
    $("#lista_usuarios").empty();
    $("#lista_usuarios").append("<option value=''>Todos</option>");
    usuarios.forEach(function (nomes) {
      let opcao_usuario = $("<option />").text(nomes);
      $("#lista_usuarios").append(opcao_usuario);
    });
  });
});
