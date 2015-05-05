var static = require('node-static');
var http = require('http');
// Create a node-static server instance
var file = new(static.Server)();
//espero una peticion(req) get del cliente y le resppondo(res) con un fichero establecido
var app = http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(8181);
// usa la libreria socket.io que es una libreria de javasrip en tiempo real
var io = require('socket.io').listen(app);

//se mantiene a la espera de algun mensaje
io.sockets.on('connection', function(socket){
	//recibe un mensaje 
	socket.on('message', function (message) {
                log('S --> got message: ', message);
                // channel-only broadcast...
                socket.broadcast.to(message.channel).emit('message', message);
                socket.in(message.channel).emit('message', message);
        });

	// Handle 'create or join' messages
    socket.on('create or join', function (room) {
            var numClients = io.sockets.clients(room).length;

            log('S --> Room ' + room + ' has ' + numClients + ' client(s)');
            log('S --> Request to create or join room', room);

            // First client joining...
            if (numClients == 0){
                    socket.join(room);
                    socket.emit('created', room);
            } else if (numClients == 1) {
            // Second client joining...                	
                    io.sockets.in(room).emit('join', room);
                    socket.join(room);
                    socket.emit('joined', room);
            } else { // max two clients
                    socket.emit('full', room);
            }
    });
    
    function log(){
        var array = [">>> "];
        for (var i = 0; i < arguments.length; i++) {
        	array.push(arguments[i]);
        	console.log(array[i]);
        }
        socket.emit('log', array);
    }
});