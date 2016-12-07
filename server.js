var port = process.env.PORT || 5000;

var express = require('express'),	// 引入express模块
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),	// 引入socket.io模块并绑定到服务器
    users = [];	// 保存所有在线用户的昵称

app.use('/', express.static(__dirname + '/www'));	// 指定静态HTML文件的位置
server.listen(8080);

// socket部分
io.on('connect', function(socket) {
	// 昵称设置
	socket.on('login', function(nickname) {
		if (users.indexOf(nickname) > -1)
			socket.emit('nickExisted');
		else {
			socket.userIndex = users.length;
			socket.nickname = nickname;
			users.push(nickname);
			socket.emit('loginSuccess');
			io.sockets.emit('system', nickname, users.length, 'login');
		};
	});

	// 断开连接的事件
	socket.on('disconnect', function() {
		// 将断开连接的用户从users中删除
		users.splice(socket.userIndex, 1);
		// 通知除自己之外的所有人
		socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
	})

	/*
													socket : 当前连接到服务器的那个客户端
															io : 服务器的整个socket连接

							socket.emit('foo') : 只有自己收到这个事件
		socket.broadcast.emit('foo') : 向除自己外的所有人发送该事件
					io.sockets.emit('foo') : 所有人都可以收到该事件
	*/

	// 接受新信息
	socket.on('postMsg', function(msg) {
		// 将消息发送到除自己外的所有用户
		socket.broadcast.emit('newMsg', socket.nickname, msg);
	});
});