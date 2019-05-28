const net = require("net");

var clients = [];
var helpstr = "\tsize\t\tGet amount of clients in Chat\r\n"+
              "\tclients\t\tGet names of clients\r\n"+
              "\tname yourname\tSets your name\r\n"+
              "\texit/dc\t\tRemoves you from the server";

const server = net.createServer((c) => {

  c.name = c.address().address;
  c.chatip = c.address().address;
  c.named = false;
  c.write("Welcome to the chat server!\r\nSet your name with \">name yourname\" or get help with \">help\"\r\n");

  // 'connection' listener
  console.log("[MA]\tClient connected: "+c.chatip);
  clients.push(c);
  writeAll(null, ">Client Connected: "+clients.length+" in Chat\r\n");

  c.on('end', () => {
    console.log('client disconnected');
    dc(c)
  });

  c.on('error', () => {
    console.log("[ERR]\tError on client "+c.name+" ("+c.chatip+")");
    dc(c);
  });

  c.on('data', (data) => {

    datastr = data.toString();

    if(datastr[0] == ">") {
      command(c, datastr);
      return;
    }

    //console.log(data.toString())
    writeAll(c, "["+c.name+"]: "+ data);

  });

});

function command(client, command) {

  var cmd = command.substring(1, command.length-1);

  if(cmd == "help") {
    client.write(helpstr+"\r\n\r\n")
  }else if(cmd == "size") {

    client.write(">"+clients.length.toString()+"\r\n");

  }else if(cmd == "clients") {

    var names = [];

    clients.forEach((c) => {
      names.push(c.name);
    });

    client.write(">["+names.toString()+"]\r\n");

  }else if(cmd == "exit"||cmd == "dc"){
    client.write("You are now disconnected from the server, "+client.name+". See you soon o/\r\n\r\n");
    client.end()
  }

  else if(cmd.includes(" ")) {
    var arg = cmd.split(" ");

    if(arg[0] == "name") {
      var old = client.name;
      client.name = arg[1];
      client.write(">Your name has been set to \""+client.name+"\"\r\n");

      //Rename public
      if(client.named == true) {
        writeAll(client, ">\""+old+"\" changed their name to \""+client.name+"\"\r\n");
      }else{
        client.named = true;
      }
    }

  }else{
    client.write(">404\r\n");
  }

}

function writeAll(exclude, buffer) {

  clients.forEach((client) => {
    if(client != exclude) {
      client.write(buffer);
    }
  });

}

function dc(client) {
  console.log("[DC]\tRemoving from list:");
  var index = clients.indexOf(client);

  if (index > -1) {
    clients.splice(index, 1);
    console.log("[DC]\t"+clients.length + " Remaining");
  } else {
    console.log("[DC]\tclient not found");
  }


  writeAll(null, ">"+client.name+" Disconnected: "+clients.length+" Remaining\r\n");

}

server.listen(1234);
