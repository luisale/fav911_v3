document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	verificar_session();
	var push = PushNotification.init({ 
	 		"android": {"senderID": "546757857806","vibrate":"true"},
     		"ios": {"alert": "true", "badge": "true", "sound": "true"}, 
     		"windows": {} } 
         );
    push.on('registration', function(data) {
        var GCMid = data.registrationId;
		window.localStorage.setItem("GCMid", GCMid);
    });
    push.on('notification', function(data) {
    	if (data.additionalData.id){
    		Notifyb(data.message,data.title,data.additionalData.id);
    	}else{
    		Notify(data.message,data.title,false);
    	};
		console.log(data.message+': '+data.title);
		console.log('additionalData '+data.additionalData.id);
    });
    push.on('error', function(e) {
		console.log(e.message);
    });
}
function Notifyb(mensaje,titulo,id){
	if (mensaje){

		if (titulo == undefined){
			var titulo = 'Fav911'
		};
		new PNotify({
	    		title: titulo,
	    		text: mensaje,
	    		icon: false,
	    		addclass:'.ui-pnotify.stack-center',
	    		hide: false,
	    		confirm:{
	    			confirm:true,
	    			buttons: [{
           				text:'Ver Aviso',
           				addClass:'notibtn',
           				click: function(notice) {
       					   $(':mobile-pagecontainer').pagecontainer('change', '#misfavoritos');
       					   misfavoritos(id);
       					   notice.remove();
           				}
		 			},
	 				{
           				text: 'Cerrar',
           				addClass:'',
           				click: function(notice) {
           				 notice.remove();
           				}
   			 		}]
	    		},
   				buttons: {
   					closer_hover: false,
   				    sticker: false

   				},
   				history: {
   				    history: false
   				}
		});
	}
}

function Notify(mensaje,titulo,hide){
	if (mensaje){

		if (titulo == undefined){
			var titulo = 'Fav911'
		};
		new PNotify({
	    		title: titulo,
	    		text: mensaje,
	    		icon: false,
	    		addclass:'.ui-pnotify.stack-center',
	    		hide: hide,
   				buttons: {
   					closer_hover: false,
   				    sticker: false

   				},
   				history: {
   				    history: false
   				}
		});
	}
}


function ordenfavorito(boton){
  var action = $(boton).attr('action');
    $( "#content_misfavoritos" ).sortable();
    $( "#content_misfavoritos" ).disableSelection();
    $( "#content_misfavoritos" ).sortable( "option", { disabled: true } );
    $( "#content_misfavoritos" ).sortable( "refresh" );
  if(action == 'ordenar'){
    	$('.text').show().next('.avisofull').hide();
    	$(boton).html('<span>Guardar</span>');
    	$( "#content_misfavoritos" ).sortable( "option", { disabled: false } );
    	$( "#content_misfavoritos > div" ).css('border','1px dashed #FF5050');
    	$(boton).attr('action','guardar');
  }else{
  		var orden = {};
    	var n = 0;
    	$("#content_misfavoritos").find('> div').each(function(){
    	  n++;
    	  orden[n] = $(this).attr('id');
    	});
    	var neworden = JSON.stringify(orden);
		var session  = window.localStorage.getItem("session");
		$.ajax({
			type: "POST",
			url: "http://www.fav911.com/ws/fav911/ordenfavorito/", 
			data: {"session":session,"neworden":neworden},
			dataType: "json", 
			cache:false,
			success: function(data){
				if (data.msj){
					Notify(data.msj,'Ordenar',true);
				};
			}
		});
    	$(boton).html('<span>Ordenar</span>');
    	$( "#content_misfavoritos" ).sortable( "option", { disabled: true } );
    	$( "#content_misfavoritos > div").css('border','none');
    	$(boton).attr('action','ordenar');
  };
}
function escapeHtml(text) {
	var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
	return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
function goToByScroll(id){
        $('#misfavoritos').animate({
            scrollTop: $(id).offset().top},
            'slow');
    }
function AlertDialog(title,msj){
	$('<div>').simpledialog2({
		mode: 'blank',
		themeHeader:'c',
		headerText: 'Mensaje',
		headerClose: true,
		blankContent : 
			"<div class='ui-content ui-body-inherit'><p>"+title+"</p><p>"+msj+"</p></div>"+
			"<a rel='close' data-role='button' href='#'>Aceptar</a>"
	});
}

function formatoJSON( selector ){
	var form = {};
	$(selector).find(':input[name]:enabled').each( function() {
		var self = $(this);
		var name = self.attr('name');
		if (form[name]) {
			form[name] = form[name] + ',' + self.val();
		}
		else {
			form[name] = self.val();
		}
	});

	return JSON.stringify(form);
}

function onPhotoDataSuccess(imageData) {
	// Descomenta esta linea para ver la imagen codificada en base64
	//console.log(imageData);
	$("#popupMenu").popup( "close" );
	var imgavs					= window.localStorage.getItem("imgavs");
	var smallImage				= document.getElementById('imgavs'+imgavs);
	smallImage.style.display	= 'block';
	smallImage.src				= "data:image/jpeg;base64," + imageData;//guarda base64 en el input(hidden) de la imagen
	$('#imagen'+imgavs).val(imageData);
	window.localStorage.removeItem("imgavs");
}

function popupcamara(imgavs){
	window.localStorage.removeItem('imgavs');
	window.localStorage.setItem("imgavs", imgavs);
	$("#popupMenu").popup( "open" );
}

function capturePhoto() {
	// Toma la imagen y la retorna como una string codificada en base64
	navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 70,targetWidth: 300, targetHeight: 300,
	destinationType: navigator.camera.DestinationType.DATA_URL });
}

function capturePhotoEdit() {
	// Toma la imagen, permite editarla y la retorna como una string codificada en base64
	navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 70,  targetWidth: 300, targetHeight: 300, allowEdit: true }); 
}

function getPhoto() {
	navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 70,  targetWidth: 300, targetHeight: 300, 
	destinationType: navigator.camera.DestinationType.DATA_URL,
	sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY });
}

function onFail(message) {
	alert('Ocurrió un error: ' + message);
} 

function logout () { 
	facebookConnectPlugin.logout( 
		function (response){ cerrar_sesion(); },
		function (response){ cerrar_sesion(); });
}

function login () {
	
	if ( $('#movil').val() == '' ) {
		Notify( 'Debe ingresar su numero de telefono ' , 'Movil',true);
		return false;
	}

	if (!window.cordova) {
		var appId = prompt("Enter FB Application ID", "151674005184259");
		facebookConnectPlugin.browserInit(appId);
	}
	facebookConnectPlugin.login( ["email"],
	function (response) { 
		if(abrir_session(response)){
			var session = JSON.stringify(response);
			var form 	= formatoJSON('#formregistro');
			var GCMid     = window.localStorage.getItem("GCMid")
			$.ajax({
				type: "POST",
				url: "http://www.fav911.com/ws/fav911/crear_usuario/", 
				data: {"session":session,"form":form,"GCMid":GCMid},
				dataType: "json", 
				cache:false,
				success: function(data){
					if (data.session == 'false'){
  				 		Notify( data.msj,'Mi Cuenta: ' );  
  				 		cerrar_sesion();
  					}else{
  				 		Notify( data.msj,'Mi Cuenta: ' );  
  				 		verificar_session();
  					};
				}
			});
		}
	},
	function (response) { 
		var msj = '';
		switch( parseFloat(response.errorCode) ){
		 case 4201 : msj = 'Cancelado por el usuario'; break;
		 default: msj = response.errorMessage ;
		}
		alert( msj );
	});
}

jQuery.fn.resetear = function () {
	$(this).each(function(){ this.reset(); });
	$('#imgavs1').attr("src","");
	$('#imgavs2').attr("src","");
	$('#imgavs3').attr("src","");
	$('#editavs_id').val( 0 );
}

function validarnuevoaviso(){
	if($('#form-aviso #avs_alias').val() == ''){ alert('Falta Alias'); return false; }
	if($('#form-aviso #avs_descripcion').val() == ''){ alert('Falta Descripcion'); return false; }
	if($('#form-aviso #avs_detalle').val() == ''){ alert('Ingrese Detalle'); return false; }
	if($('#form-aviso #avs_cobertura').val() == ''){ alert('Ingrese Cobertura'); return false; }
	if($('#avs_categoria').val() == ''){ alert('Falta Categoria'); return false; }
	if($('#form-aviso #avs_direccion').val() == ''){ alert('Falta Direccion'); return false; }

	return true;
}

function getselcategoria(){
	var session = window.localStorage.getItem("session");
	$('#avs_categoria').html('<option data-placeholder="true">Seleccione Una Categoria</option>');
	$.ajax({
		type: "POST",
		url: "http://www.fav911.com/ws/fav911/getcategorias/", 
		data: {"session":session},
		dataType: "json", 
		cache:false,
		success:
		function(data){
			$.each(data,function(index,cat){
				$('#avs_categoria').append('<option value="'+cat.sel_id+'">'+cat.sel_nombre+'</option>');
			});
		 $('#avs_categoria').selectmenu('refresh');
		}
	});  
}

function avisosnoti(){
	var session = window.localStorage.getItem("session");
	$('#avisosnoti').html('<option data-placeholder="true">Seleccione Un Aviso</option>');
	$.ajax({
		type: "POST",
		url: "http://www.fav911.com/ws/fav911/avisosnoti/", 
		data: {"session":session},
		dataType: "json",  
		cache:false,
		success:
		function(data){
			$.each(data,function(index,val){
				$('#avisosnoti').append('<option value="'+val.avs_id+'">'+val.avs_alias+'</option>');
			});
		 $('#avisosnoti').selectmenu('refresh');
		}
	});  
}

function guardarnoti(){
	var session = window.localStorage.getItem("session");
	var form = formatoJSON('#form-notificacion');
	$.ajax({
		type: "POST",
		url: "http://www.fav911.com/ws/fav911/guardarnoti", 
		data: {"session":session,"form":form},
		dataType: "json",  
		cache:false,
		success: function(data){
			$(':mobile-pagecontainer').pagecontainer('change', '#inicio');
			Notify(data.msj ,'Notificacion: ',true);
		}
	});
}

$(document).ready(function(){
	$("#avs_pais").change(function(){
		var idparent = $(this).val();
		getzona(idparent,'region');
	});
	$("#avs_region").change(function(){
		var idparent = $(this).val();
		getzona(idparent,'comuna');
	});
});

function getzona(idparent,valor,id){
	var session = window.localStorage.getItem("session");
	$('#avs_'+valor).html('<option data-placeholder="true">Seleccione '+valor+'</option>');
	$.ajax({
		type: "POST",
		url: "http://www.fav911.com/ws/fav911/getzonas/"+idparent+"/"+valor, 
		data: {"session":session},
		dataType: "json",  
		cache:false,
		success:
		function(data){
			$.each(data,function(index,val){
				$('#avs_'+valor).append('<option value="'+val.idzona+'">'+val.nombrezona+'</option>');
			});
		 $('#avs_'+valor).selectmenu('refresh');
		 if(id){
				$('#avs_'+valor+' option[value="'+id+'"]').prop('selected', true);
				$('#avs_'+valor).selectmenu('refresh');
				 window.localStorage.removeItem('imgavs');
			};
		}
	});  
}

function editavs(id_avs){

	var session = window.localStorage.getItem("session");
	$('#form-aviso').resetear();
	getselcategoria();

	$.ajax({
	  type: "POST",
	  url: "http://www.fav911.com/ws/fav911/getaviso/", 
	  data: {"session":session,"id_avs":id_avs},
	  dataType: "json",  
	  cache:false,
	  success: 
		function(data){
			if( data.avs_id!= undefined) $('#form-aviso #editavs_id').val(data.avs_id);
			if( data.avs_alias!= undefined) $('#form-aviso #avs_alias').val(data.avs_alias);
			if( data.avs_descripcion!= undefined) $('#form-aviso #avs_descripcion').val(data.avs_descripcion);
			if( data.avs_detalle!= undefined) $('#form-aviso #avs_detalle').val(data.avs_detalle);
			if( data.avs_cobertura!= undefined) $('#form-aviso #avs_cobertura').val(data.avs_cobertura);

			if( data.avs_categoria!= undefined) {
				$('#avs_categoria option[value="'+data.avs_categoria+'"]').prop('selected', true);
				$('#avs_categoria').selectmenu('refresh');
			}
			if( data.avs_color!= undefined) {
				$('#avs_color option[value="'+data.avs_color+'"]').prop('selected', true);
				$('#avs_color').selectmenu('refresh');
			}
			if( data.con_nombre != undefined ) $('#form-aviso #con_nombre').val(data.con_nombre);
			if( data.con_apaterno != undefined ) $('#form-aviso #con_apaterno').val(data.con_apaterno);
			if( data.con_amaterno != undefined ) $('#form-aviso #con_amaterno').val(data.con_amaterno);
			if( data.con_rut != undefined ) $('#form-aviso #con_rut').val(data.con_rut);

			if( data.horas[0] != undefined ){
				$('#form-aviso #hlunes').val(data.horas[0].hrs_lunes);
				$('#form-aviso #hmartes').val(data.horas[0].hrs_martes);
				$('#form-aviso #hmiercoles').val(data.horas[0].hrs_miercoles);
				$('#form-aviso #hjueves').val(data.horas[0].hrs_jueves);
				$('#form-aviso #hviernes').val(data.horas[0].hrs_viernes);
				$('#form-aviso #hsabado').val(data.horas[0].hrs_sabado);
				$('#form-aviso #hdomingo').val(data.horas[0].hrs_domingo);
			}
			imgn = 0;
			if (data.imagenes){
				$.each(data.imagenes,function(index,img){
					imgn++;
					$('#form-aviso #imagen'+imgn).val(img.img_codigo);
					$('#form-aviso #imagenid'+imgn).val(img.img_id);
					$('#form-aviso #imgavs'+imgn).attr("src", "data:image/jpeg;base64,"+img.img_codigo);
				});
			}

			tagn = 0;
			if (data.ctags){
				$.each(data.ctags,function(index,tag){
					tagn++;
					$('#form-aviso #tag'+tagn).val(tag.tgs_alias);
				});
			}
			if( data.dir_lat!= undefined) $('#form-aviso #avs_lat').val(data.dir_lat);
			if( data.dir_long!= undefined) $('#form-aviso #avs_lng').val(data.dir_long);
			if( data.avs_direccion!= undefined) $('#form-aviso #avs_direccion').val(data.avs_direccion);

			window.localStorage.setItem("lat", data.dir_lat);
			window.localStorage.setItem("lng", data.dir_long);

		},
		complete:function(){
			var lati = window.localStorage.getItem("lat");
			var longi = window.localStorage.getItem("lng");
			mapdireccion(lati,longi);
		}
	});
}

function guardaraviso (){
	
	if ($('#form-aviso #editavs_id').val() > 0 ){
		var metodo = 'edit_aviso';
	}else{
		var metodo = 'crear_aviso';
	}
	if(validarnuevoaviso()){
		var session = window.localStorage.getItem("session");
		var form = formatoJSON('#form-aviso');
		$.ajax({
			type: "POST",
			url: "http://www.fav911.com/ws/fav911/"+metodo, 
			data: {"session":session,"form":form},
			dataType: "json",  
			cache:false,
			success: function(data){
				if (data.msj){
					Notify(data.msj,'Mis Avisos',true);
					$(':mobile-pagecontainer').pagecontainer('change', '#inicio'); 
				};
			}
		});
	}
}

function opendiv(elemt,rel,id){
	var action = $('#ordenarfav').attr('action');
  	if ( action != 'guardar' ){
		$('.text').show().next('.avisofull').hide();
		$(elemt).hide();
		$(elemt).next('.avisofull').toggle();
		if (id){
			var session = window.localStorage.getItem("session");
			$.ajax({
				type: "POST",
				url: "http://www.fav911.com/ws/fav911/getimagenes/", 
				data: {"session":session,"id_avs":id},
				dataType: "json",  
				cache:false,
				beforesend: function(){
					$('#avsgaleria'+rel).html('<div class="swiper-container'+rel+'"><div class="swiper-wrapper"><div class="swiper-slide"><img src="img/ajaxloader.gif"/></div></div><div class="swiper-pagination swiper-pagination'+rel+'"></div></div>');
				},
				success: function(data){
					$('#avsgaleria'+rel).html('');
					var datajson = JSON.stringify(data);
					if (datajson != '[{}]'){
						var stringimg = '';
						$.each(data,function(index,value){
							if( value.img_codigo ){
								stringimg = stringimg + '<div class="swiper-slide"><img src="data:image/png;base64,'+value.img_codigo+'" /></div>'; 
							}
						});
						var galeria = '<div class="swiper-container'+rel+'"><div class="swiper-wrapper">'+stringimg+'</div><div class="swiper-pagination swiper-pagination'+rel+'"></div></div>';
						$('#avsgaleria'+rel).prepend(galeria);
						var swiper = new Swiper('.swiper-container'+rel,{ pagination: '.swiper-pagination'+rel });
					}
				}
			});
		};
	};
}

function misavisos (){
	var session = window.localStorage.getItem("session");
	$('#content_misfavoritos').html('');
	$('#content_anuncios').html('');
	$('#content_misavisos').html('');
	$.ajax({
		type: "POST",
		url: "http://www.fav911.com/ws/fav911/getmisavisos/", 
		data: {"session":session},
		dataType: "json",  
		cache:false,
		success: function(data){
			var rel = 0;
			$.each(data,function(index,value){
				rel++;
				var ctagsjson = JSON.stringify(value.ctags);
				var strtag = '';

				if (ctagsjson != '[{}]'){
					strtag = '<div class="tags">';
					$.each(value.ctags,function(index,tag){
						strtag = strtag + '<span>'+tag.tgs_alias+'</span>';
					});
					strtag = strtag + '</div>';
				}

				$('#content_misavisos').append(''
					+'<div class="aviso reg ui-btn ui-corner-all '+ value.avs_color +' nosonmbra" id="miaviso'+value.avs_id+'">'
						+'<div class="cont" >'
							+'<div class="ui-btn-icon-left ui-icon-location big-icon3" onclick="gotoLocation('+value.avs_id+');" ></div>'
							+'<div class="ui-btn-icon-left ui-icon-delete big-icon3" onclick="gotoDeleteAnuncio('+value.avs_id+')" ></div>'
						+'</div>'
						+'<div onclick="opendiv(this,'+ rel +','+value.avs_id+')" class="text" >'
							+'<div class="title">'+ value.avs_alias +'</div>'
							+'<div class="desc">'+value.avs_descripcion+'</div>'
						+'</div>'
						+'<div class="avisofull" >'
							+'<div class="accion">'
								+'<a class="ui-btn ui-corner-all " href="#nuevoaviso" onclick="editavs('+value.avs_id+');" >Editar</a>'
							+'</div>'
							+'<div class="alias">'+ value.avs_alias +'</div>'
							+'<div class="descripcion">'+value.avs_descripcion+'</div>'
							+'<div id="avsgaleria'+rel+'" class="galeria"></div>'
							+'<div class="detalle">'+value.avs_detalle+'</div>'
							+strtag
						+'</div>'
					+'</div>');

			});
		}
	});
}

function borrarnoti(id){
	var session = window.localStorage.getItem("session");
	var r = confirm("Desea Eliminar esta Notificacion ? ");
	if (r == true) {
		$.ajax({
			type: "POST",
			url: "http://www.fav911.com/ws/fav911/borrarnoti/"+id, 
			data: {"session": session},
			dataType: "json",  
			cache:false,
			success: function(data){
				$('#minoti'+id).slideUp( "slow", function() { $(this).remove() });
			}
		});
	}
}

function activarnoti(idntf){
	var session = window.localStorage.getItem("session");
    var deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : "null";

                          
	$.ajax({
		type: "POST",
		url: "http://www.fav911.com/ws/fav911/activarnoti/"+idntf, 
		data: {"session":session,"device":deviceType},
		dataType: "json",  
		cache:false,
		success: function(data){
			if (data.msj){
				Notify(data.msj,'Mis Notificaciones',true)
			}else{
				Notify(data.msj,'Mis Notificaciones',true)
			};
		},
		complete:function(){
			misnotificaciones();
		}
	});
}

var misnotificaciones =  function(){
	var session = window.localStorage.getItem("session");
	$('#content_misnotificaciones').html('');
	$.ajax({
		type: "POST",
		url: "http://www.fav911.com/ws/fav911/getmisnotificaciones/", 
		data: {"session":session},
		dataType: "json",  
		cache:false,
		success: function(data){
			var rel = 0;
			$.each(data,function(index,value){
				if( value.nft_id ){
					rel++;
					if(value.nft_activo == 1){
						color = 'c_celeste';
					}else{
						color = '';
					}
					$('#content_misnotificaciones').append(''
						+'<div class="aviso favoritos reg ui-btn ui-corner-all '+color+' nosonmbra" id="minoti'+value.nft_id+'" >'
							+'<div class="cont" >'
								+'<div class="ui-btn-icon-left ui-icon-delete big-icon3" onclick="borrarnoti('+value.nft_id+')" ></div>'
							+'</div>'
							+'<div onclick="opendiv(this,'+ rel +')"  class="text" >'
								+'<div class="title">'+ value.nft_alias +'</div>'
							+'</div>'
							+'<div class="avisofull" >'
								+'<div class="accion">'
									+'<a class="ui-btn ui-corner-all " href="javascript:void(0);" onclick="activarnoti('+value.nft_id+');" >Publicar</a>'
								+'</div>'
								+'<div class="alias">'+ value.nft_alias +'</div>'
								+'<div class="detalle">'+value.nft_detalle+'</div>'
								+'<div class="descripcion">Aviso: '+value.avs_alias+'</div>'
							+'</div>'
						+'</div>');

				}
			});
		}
	});
}

var misfavoritos =  function(id){

	var session = window.localStorage.getItem("session");
	$('#content_misfavoritos').html('');
	$('#content_anuncios').html('');
	$('#content_misavisos').html('');

	$.ajax({
		type: "POST",
		url: "http://www.fav911.com/ws/fav911/getmisfavoritos/", 
		data: {"session":session},
		dataType: "json",  
		cache:false,
		success: function(data){
			var rel = 0;
			$.each(data,function(index,value){
				rel++;
				if (value.prv_id || value.avs_id){
					if (value.fav_tipo == 2){
						var ctagsjson = JSON.stringify(value.ctags);
						var llamar = '';
						
						if( value.con_movil ){
							llamar = '<a class="ui-btn ui-btn-icon-left ui-icon-phone ui-corner-all " href="tel:'+value.con_movil+'">Llamar</a>';
						}

						if (ctagsjson != '[{}]'){
							strtag = '<div class="tags">';
							$.each(value.ctags,function(index,tag){
								strtag = strtag + '<span>'+tag.tgs_alias+'</span>';
							});
							strtag = strtag + '</div>';
						}
						srtnoti = '';
						if (value.nft_alias){
							var title = escapeHtml(value.nft_alias);
							var msj   = escapeHtml(value.nft_detalle);
							srtnoti = '<div class="ui-btn-icon-left ui-icon-comment big-icon3" onclick="Notify(\''+msj+'\',\''+title+'\',true);" ></div>';
						};

						$('#content_misfavoritos').append(''
							+'<div rel="'+rel+'" class="aviso reg ui-btn ui-corner-all '+ value.avs_color +' nosonmbra" id="aviso'+value.fav_id+'" >'
								+'<div class="cont" >'
									+'<div class="ui-btn-icon-left ui-icon-location big-icon3" onclick="gotoLocation('+value.avs_id+');" >'+'</div>'
									+'<div class="ui-btn-icon-left ui-icon-delete big-icon3" onclick="gotoDeleteFav('+value.avs_id+');" ></div>'
									+srtnoti
								+'</div>'
								+'<div id="textfav'+value.avs_id+'" onclick="opendiv(this,'+ rel +','+value.avs_id+')"  class="text" >'
									+'<div class="title">'+ value.avs_alias +'</div>'
									+'<div class="desc">'+value.avs_descripcion+'</div>'
								+'</div>'
								+'<div class="avisofull" >'
									+'<div class="accion">' + llamar +'</div>'
									+'<div class="alias">'+ value.avs_alias +'</div>'
									+'<div class="descripcion">'+value.avs_descripcion+'</div>'
									+'<div id="avsgaleria'+rel+'" class="galeria"></div>'
									+'<div class="detalle">'+value.avs_detalle+'</div>'
									+strtag
								+'</div>'
							+'</div>');
					}else{
						var llamar2 = '';
						if( value.prv_movil ){
							llamar2 = '<a href="tel:'+value.prv_movil+'" class="llamar ui-btn-icon-right ui-icon-phone big-icon4" >Llamar</a>';
						}
						$('#content_misfavoritos').append('<div class="aviso favoritos reg ui-btn ui-corner-all c_gris nosonmbra"  id="aviso'+value.fav_id+'" ><div class="cont" ><div class="ui-btn-icon-left ui-icon-delete big-icon3" onclick="gotoDeleteFav('+value.prv_id+' );" ></div></div><div class="text"><div class="title">'+value.prv_alias+'</div></div>'+llamar2+'</div>');
					};
				};
			});
		}
	}).done(function(){
		if (id){
   			//goToByScroll('#content_misfavoritos #textfav'+id);
   			window.setTimeout(function(){
   				$('#content_misfavoritos #textfav'+id).trigger( "click" );
   				var p =	$('#textfav'+id).parent().parent().offset();
	   				$.mobile.silentScroll(p.top+500);
   			}, 1500);
	   				//$('body').scrollTo('#textfav'+id);
		};
	});
}

var showDialog = function () { 
	facebookConnectPlugin.showDialog( { method: "feed" }, 
	function (response) { console.log(JSON.stringify(response)) },
	function (response) { console.log(JSON.stringify(response)) });
}

var apiTest = function () { 
	facebookConnectPlugin.api( "me/?fields=id,email", ["user_birthday"],
	function (response) { console.log(JSON.stringify(response)) },
	function (response) { console.log(JSON.stringify(response)) }); 
}

var logPurchase = function () {
	facebookConnectPlugin.logPurchase(1.99, "USD",
	function (response) { console.log(JSON.stringify(response)) },
	function (response) { console.log(JSON.stringify(response)) });
}

var logEvent = function () {
	facebookConnectPlugin.logEvent("Purchased",
	{
		NumItems: 1,
		Currency: "USD",
		ContentType: "shoes",
		ContentID: "HDFU-8452"
	}, null,
	function (response) { console.log(JSON.stringify(response)) },
	function (response) { console.log(JSON.stringify(response)) });
}

var getAccessToken = function () { 
	facebookConnectPlugin.getAccessToken( 
		function (response) { console.log(JSON.stringify(response)) },
		function (response) { console.log(JSON.stringify(response)) }
	);
}

var abrir_session = function(response){
	var session = JSON.stringify(response);
	window.localStorage.setItem("session", session);
	return verificar_session(); 
}

var cerrar_sesion = function(){
	window.localStorage.removeItem("session");
	verificar_session();
	$(':mobile-pagecontainer').pagecontainer('change', '#inicio');
}

var verificar_session = function(){

	if( window.localStorage.getItem("session") ){

		jQuery('#btnpopupPadded').hide();
		jQuery('#btnpopupPaddedcerrar').show();
		
		jQuery('#btnpopupPadded2').hide();
		jQuery('#btnpopupPadded2cerrar').show();
		
		jQuery('#btnpopupPadded3').hide();
		jQuery('#btnpopupPadded3cerrar').show();

		jQuery('#btnpopupPadded4').hide();
		jQuery('#btnpopupPadded4cerrar').show();

		jQuery('#nuevo1,#nuevo2,#nuevo3,#nuevo4').css('opacity', '1');;
		return true;
	}else{
		jQuery('#btnpopupPadded').show();
		jQuery('#btnpopupPaddedcerrar').hide();

		jQuery('#btnpopupPadded2').show();
		jQuery('#btnpopupPadded2cerrar').hide();

		jQuery('#btnpopupPadded3').show();
		jQuery('#btnpopupPadded3cerrar').hide();

		jQuery('#btnpopupPadded4').show();
		jQuery('#btnpopupPadded4cerrar').hide();
		
		jQuery('#nuevo1,#nuevo2,#nuevo3,#nuevo4').css('opacity', '0');;
		return false;
	}

}

var getStatus = function () { 
	facebookConnectPlugin.getLoginStatus( 
	function (response) {
		if ( response.status == 'connected'){
			abrir_session(response);
		}else{
			login();
		}
	},
	function (response) { alert(JSON.stringify(response)) }
	);
}

var ajax = function (){
	if ( verificar_session() ){
		var session = window.localStorage.getItem("session");
		alert('verificar session: Si '+session);
	}else{
		alert('verificar session: No Hay');

	};
}