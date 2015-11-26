
var googleapi = {
	authorize: function(options) {
    var deferred = $.Deferred();

    //Build the OAuth consent page URL
    var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
        client_id: options.client_id,
        redirect_uri: options.redirect_uri,
        response_type: 'code',
        scope: options.scope
    });
	var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');
    $(authWindow).on('loadstart', function(e) {
        var url = e.originalEvent.url;
        var code = /\?code=(.+)$/.exec(url);
        var error = /\?error=(.+)$/.exec(url);

        if (code || error) {
            //Always close the browser when match is found
            authWindow.close();
        }

        if (code) {
            //Exchange the authorization code for an access token
            $.post('https://accounts.google.com/o/oauth2/token', {
                code: code[1],
				client_id: options.client_id,
				client_secret: options.client_secret,
				redirect_uri: options.redirect_uri,
				grant_type: 'authorization_code'
			}).done(function(data) {
				deferred.resolve(data);
			}).fail(function(response) {
				deferred.reject(response.responseJSON);
			});
		} else if (error) {
            //The user denied access to the app
			deferred.reject({
				error: error[1]
            });
        }
    });

		return deferred.promise();
	}
};

function googlejson(data){
	var objeto = {'authResponse':{'userID': data.id ,'accessToken': data.email }};
	return objeto;
}

function googlelogin(){

	if ( $('#movil').val() == '' ) {
		Notify( 'Debe ingresar su n\u00famero de tel\u00e9fono ' , 'Movil',true);
		return;
	}
	if ( $('#alias').val() == '' ) {
		Notify( 'Debe ingresar su alias ' , 'Alias',true);
		return;
	}

	googleapi.authorize({
		client_id: '1099273742112-ieg7839amcb3fo6p48v32ep93i2miop0.apps.googleusercontent.com',
		client_secret: '',
		redirect_uri: 'http://localhost',
		scope: 'email'
	}).done(function(data) {
		$.ajax({
			url: 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + data.access_token,
			data: null,
			success: function(resp) { 
				var objeto = googlejson(resp);
				if (abrir_session(objeto) ){
					var session  = JSON.stringify(objeto);
					var form     = formatoJSON('#formregistro');
					var GCMid    = window.localStorage.getItem("GCMid");
					var deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : "null";

					$.ajax({
						type: "POST",
						url: "http://www.fav911.com/ws/fav911/crear_usuario/", 
						data: {"session":session,"form":form,"GCMid":GCMid,"device":deviceType},
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
			dataType: "jsonp"
		});
	}).fail(function(data) {
		alert('Error Login Google');
	});
}

function mapdireccion(lat,lng){
   $('#mapdireccion').html('');
	$(document).ready(function(){

		navigator.geolocation.getCurrentPosition(function (position){
			if (lat && lng){
				var latitud  = lat;
				var longitud = lng;
			}else{
				var latitud  = position.coords.latitude;
				var longitud = position.coords.longitude;
			}
			var myLatlng = new google.maps.LatLng(latitud,longitud);
			document.getElementById('avs_lat').value = position.coords.latitude;
			document.getElementById('avs_lng').value = position.coords.longitude;
			var geocoder = new google.maps.Geocoder();
			var myOptions = {
			  zoom: 12,
			  center: myLatlng,
			  mapTypeId: google.maps.MapTypeId.ROADMAP
			}
			var map3 = new google.maps.Map(document.getElementById("mapdireccion"), myOptions);
			var marker3 = new google.maps.Marker({
				position: myLatlng, 
				map: map3,
				draggable:true
			});
			google.maps.event.addListener(
				marker3,
				'drag',
				function() {
					document.getElementById('avs_lat').value = marker3.position.lat();
					document.getElementById('avs_lng').value = marker3.position.lng();
				}
			);
		});
	})
}

function obtenerdireccion(){
    var geocoder = new google.maps.Geocoder();
    var lat = document.getElementById('avs_lat').value;
    var lng = document.getElementById('avs_lng').value;
    var myLatlng2 = new google.maps.LatLng(lat,lng);
    geocoder.geocode({'latLng': myLatlng2},processGeocoder);
}

function processGeocoder(results, status){

    if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                var num  = results[0].address_components[0].long_name;
                var dir  = results[0].address_components[1].long_name;
                var com  = results[0].address_components[3].long_name;
                var ciu  = results[0].address_components[4].long_name;
                var reg  = results[0].address_components[5].long_name;
                var pais = results[0].address_components[6].long_name;
                var direccion = dir+' '+num+', '+com +', '+ciu +', '+reg +', '+pais;
                alert(direccion);
                //results[0].formatted_address
                document.getElementById('avs_direccion').value=direccion;
            }else{
                alert('Google Direccion no retorno resultado alguno.');
            }
    }else{
        alert("Direccion fallo debido a : " + status);
    }
}

jQuery(document).on('pageshow', '#inicio', function (e, data) {
	
	verificar_session();
})

jQuery(document).on('pageshow', '#misavisos', function (e, data) {
	if( window.localStorage.getItem("session") ){
		jQuery('#nuevo1').show();
	}else{
		jQuery('#nuevo1').hide();
	}
})

jQuery(document).on('pageshow', '#nuevoaviso', function (e, data) {
	if( window.localStorage.getItem("session") ){
		mapdireccion();
		jQuery('#nuevo2').show();
	}else{		
		jQuery('#nuevo2').hide();
	}
})

jQuery(document).on('pageshow', '#misfavoritos', function (e, data) {
	if( window.localStorage.getItem("session") ){
		jQuery('#nuevo3').show();
	}else{
		jQuery('#nuevo3').hide();
	}
})

jQuery(document).on('pageshow', '#notificaciones', function (e, data) {
	if( window.localStorage.getItem("session") ){
		jQuery('#nuevo4').show();
	}else{
		jQuery('#nuevo4').hide();
	}
})
 
jQuery(document).on('pageshow', '#mapa', function (e, data) {
	jQuery('#mapacontent').height(getRealContentHeight());
	 $(document).ready(function(){
	   initMap();
    })
	//jQuery.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyBxyd-3l6OnWRZRYxEZkB6EByV-I_mVhfk&signed_in=true&callback=initMap');
});

jQuery(document).on('pageshow', '#mapa2', function (e, data) {
	//jQuery('#mapacontent2').height(getRealContentHeight());
	var  mid = window.localStorage.getItem("mostrarmapa");
	 mostrarMapa(mid);
	//jQuery.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyBxyd-3l6OnWRZRYxEZkB6EByV-I_mVhfk&signed_in=true&callback=initMap');
});

function registrarse( id )
{
	if ( $('#movil').val() == '' ) {
		Notify( 'Debe ingresar su n\u00famero de tel\u00e9fono ' , 'Movil',true);
		return;
	}

	if ( $('#alias').val() == '' ) {
		Notify( 'Debe ingresar su alias ' , 'Alias',true);
		return;
	}
	$( '#popupPadded' ).popup( 'close' );
	setTimeout(function() { $( '#authpropio' ).popup( 'open' ); }, 700);
}

function iniciarse( id )
{
	$( '#popupPadded' ).popup( 'close' );
	setTimeout(function() { $( '#iniciarsession' ).popup( 'open' ); }, 700);
}

function authpropio()
{ 
	var clave1 = $('#pass').val() ;
	var clave2 = $('#passcheck').val();

	if (clave1 != clave2) {
		Notify( 'Las contrase\u00f1as no coinciden  ' , 'Contrase\u00f1a',true);
		return;
	}

	var expr = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if ( !expr.test($('#email').val()) ){
		Notify( 'Debe ingresar un E-mail v\u00e1lido' , 'E-mail',true);
		return;
	}

	if (clave1 == clave2) 
	{
		var session		= window.localStorage.getItem("session");
		var form		= formatoJSON('#formregistro');
		var form2		= formatoJSON('#formauthpropio');

		var objeto		= {'authResponse':{'userID': $('#email').val() ,'accessToken': $('#email').val() }};
		
		if (abrir_session(objeto) )
		{
			var session		= JSON.stringify(objeto);
			var form		= formatoJSON('#formregistro');
			var GCMid		= window.localStorage.getItem("GCMid");
			var deviceType	= (navigator.userAgent.match(/iPad/i))  == "iPad" 
								? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" 
								? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" 
								? "Android" : "null";
			$.ajax({
				type : "POST",
				url : "http://www.fav911.com/ws/fav911/crear_usuario", 
				data: {"session":session,"form":form,"form2":form2,"GCMid":GCMid,"device":deviceType},
				dataType: "json",
				cache : false,
				success : function ( data ) 
				{
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
	} 
} 

function iniciarsession(){
	
	var form	= formatoJSON('#forminiciarsession');
	$.ajax({  
		type : "POST",
		url : "http://www.fav911.com/ws/fav911/loginUsuario", 
		data : { "form" : form },
		dataType : "json",
		cache : false,
		success : function ( data ) 
		{
			if( data.userID == 'false')
			{
				Notify( data.msj,'Mi Cuenta: ' );  
				cerrar_sesion();
			}
			else
			{
				var objeto		= { 'authResponse' : { 'userID' : data.userID , 'accessToken' : data.accessToken } };
				if (abrir_session(objeto) )
				{
					Notify( data.msj , 'Mi Cuenta: ' );  
					verificar_session();
				}
			}
		}
	});

}

function initMap2(){
	jQuery("#buscador3").val( jQuery("#buscador4").val() );
	initMap();
}

function initMap(){
	navigator.geolocation.getCurrentPosition(function ( position ) {
		var map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: position.coords.latitude , lng: position.coords.longitude },
			zoom: 13,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});
		var mrkr = new google.maps.Marker({
			position: new google.maps.LatLng( position.coords.latitude, position.coords.longitude), map: map
		});
		setMarkers(map, position);

    }, function (e) { alert('code: ' + e.code + '\n' + 'message: ' + e.message + '\n');  });
}

var infowindows = [];

function setMarkers( map , posicion ) {

	var loaded_markers_id = [];	
	var palabra	= jQuery("#buscador3").val();
	var image = {
		url: 'img/icono2.png',
		size: new google.maps.Size(20, 33),
		origin: new google.maps.Point(0,0),
		anchor: new google.maps.Point(10, 33)
	};
	$.ajax({
		type : "POST",
		url : "http://www.fav911.com/ws/fav911/getAvisosMapa", 
		//data : { "palabra" : palabra, "lat" :  -33.485231 , 'lng' : -70.6517296, "radio" : radius },
		data : { "palabra" : palabra, "lat" :  posicion.coords.latitude , 'lng' : posicion.coords.longitude  },
		dataType: "json",
		cache : false,
		success : function ( data ) {
			jQuery.each( data , function ( i, marker) {
				if( marker.dir_lat && marker.dir_long ){
					var mrkr = new google.maps.Marker({
						position: new google.maps.LatLng(marker.dir_lat, marker.dir_long),
						map: map,
						icon: image,
						zIndex: i+1
					});
					if( verificar_session() ){
						var seguir = '<a class="gmapBtn gris" href="javascript:void(0);" onclick="return seguir(\''+marker.avs_id+'\', '+i+' );">Seguir</a><br />';
					}else{
						var seguir = '';
					}

					if(marker.usr_movil){
						seguir = seguir+'<a class="gmapBtn naranjo" href="tel:'+marker.usr_movil+'" >Llamar</a> ';
					}

					var infowindow = new google.maps.InfoWindow({
						content: seguir
					});
					mrkr.addListener('click', function() {
						infowindow.open(map, mrkr);
					}); 
					
					infowindows.push(infowindow);

					google.maps.event.addListener(infowindow, 'domready', function() {
						var iwOuter = $('.gm-style-iw');
						var iwBackground = iwOuter.prev();
						iwBackground.children(':nth-child(2)').css({'display' : 'none'});
						iwBackground.children(':nth-child(3)').css({'display' : 'none'});
						iwBackground.children(':nth-child(4)').css({'display' : 'none'});
					});
				}
			});
		}
	});
}
 
function addProveedor () {
	var session = window.localStorage.getItem("session");
	if ( $('#prv_alias').val() == '' || $('#prv_movil').val() == '' ){
		alert( 'Debe ingresar un nombre y el numero de telefono ' );
		return false;
	}

	var form    = formatoJSON('#form-proveedor');
	$.ajax({
		type: "POST",
		url: "http://www.fav911.com/ws/fav911/agregar_proveedor", 
		data: {"session":session,"form":form},
		dataType: "json",  
		cache:false,
		success: function(data){
			if( data.existe > 0 ){
				$('.msj').attr('rel', data.existe ).slideDown();
			}else{
				$(':mobile-pagecontainer').pagecontainer('change', '#inicio'); 
			}
		}
	});
	return false;
}

function prvExiste() {	
	var session = window.localStorage.getItem("session");
	var usrid = $('.msj').attr('rel');
	$('.msj').slideUp();
	if( usrid > 0 ){
		$(':mobile-pagecontainer').pagecontainer('change', '#resultados'); 
		$('#content_anuncios').html('');
		$.ajax({
			type: "POST",
			url: "http://www.fav911.com/ws/fav911/getAvisosUid/"+usrid, 
			data: {"session":session},
			dataType: "json",  
			cache:false,
			success: function(data){
				if( value.avs_id ){
					rel++;

					var ctagsjson = JSON.stringify(value.ctags);
					var strtag = '';
					var llamar = '';
					if (ctagsjson != '[{}]'){
						strtag = '<div class="tags">';
						$.each(value.ctags,function(index,tag){
							strtag = strtag + '<span>'+tag.tgs_alias+'</span>';
						});
						strtag = strtag + '</div>';
					}

					if( value.con_movil ){
						llamar = '<a href="tel:'+value.con_movil+'" class="llamar ui-btn-icon-right ui-icon-phone big-icon4" >Llamar</a>';
					}

					if( verificar_session() ){
						if( value.fav_id ){
							var add_delete_fav = '<div class="ui-btn-icon-left ui-icon-delete big-icon3" onclick="gotoDeleteFav('+value.avs_id+',1);" ></div>';
						}else{
							var add_delete_fav = '<div class="ui-btn-icon-left ui-icon-star big-icon3" onclick="gotoAddFav('+value.avs_id+',1);" ></div>';
						}  
					} else{
						var add_delete_fav = '';
					}

					$('#content_anuncios').append(''
						+'<div class="aviso reg ui-btn ui-corner-all '+ value.avs_color +' nosonmbra" id="aviso'+value.avs_id+'" >'
							+'<div class="cont" >'
								+'<div class="ui-btn-icon-left ui-icon-location big-icon3" onclick="gotoLocation('+value.avs_id+');" ></div>'
								+ add_delete_fav
							+'</div>'
							+'<div onclick="opendiv(this,'+ rel +','+value.avs_id+')"  class="text" >'
								+'<div class="title">'+ value.avs_alias +'</div>'
							+'</div>'
							+'<div class="avisofull" >'
								+'<div class="accion">'+llamar+'</div>'
								+'<div class="alias">'+ value.avs_alias +'</div>'
								+'<div class="descripcion">'+value.avs_descripcion+'</div>'
								+'<div id="avsgaleria'+rel+'" class="galeria"></div>'
								+'<div class="detalle">'+value.avs_detalle+'</div>'
								+strtag
							+'</div>'
						+'</div>');
				} 
			}
		});
	}
	return false;
}

function buscar ( palabra ){
    var session = window.localStorage.getItem("session");

	$(':mobile-pagecontainer').pagecontainer('change', '#resultados'); 
	$('#content_misfavoritos').html('');
	$('#content_anuncios').html('');
	$('#content_misavisos').html('');
	$.ajax({
		type: "POST",
		url: "http://www.fav911.com/ws/fav911/getAvisos", 
		data: {"session": session , "palabra": palabra },
		dataType: "json",  
		cache:false,
		success: function(data){
			var rel = 0;
			$.each(data,function(index,value){
				if( value.avs_id ){
					rel++;
					var ctagsjson = JSON.stringify(value.ctags);
					var strtag = '';
					var llamar = '';
					if (ctagsjson != '[{}]'){
						strtag = '<div class="tags">';
						$.each(value.ctags,function(index,tag){
							strtag = strtag + '<span>'+tag.tgs_alias+'</span>';
						});
						strtag = strtag + '</div>';
					}
					if( value.con_movil ){
						llamar = '<a href="tel:'+value.con_movil+'" class="llamar ui-btn-icon-right ui-icon-phone big-icon4" >Llamar</a>';
					}
					if( verificar_session() ){
						if( value.fav_id ){
							var add_delete_fav = '<div class="ui-btn-icon-left ui-icon-delete big-icon3" onclick="gotoDeleteFav('+value.avs_id+',1);" ></div>';
						}else{
							var add_delete_fav = '<div class="ui-btn-icon-left ui-icon-star big-icon3" onclick="gotoAddFav('+value.avs_id+',1);" ></div>';
						}  
					} else{
						var add_delete_fav = '';
					}
					$('#content_anuncios').append(''
						+'<div class="aviso reg ui-btn ui-corner-all '+ value.avs_color +' nosonmbra" id="aviso'+value.avs_id+'" >'
							+'<div class="cont" >'
								+'<div class="ui-btn-icon-left ui-icon-location big-icon3" onclick="gotoLocation('+value.avs_id+');" ></div>'
								+ add_delete_fav
							+'</div>'
							+'<div onclick="opendiv(this,'+ rel +','+value.avs_id+')"  class="text" >'
								+'<div class="title">'+ value.avs_alias +'</div>'
							+'</div>'
							+'<div class="avisofull" >'
								+'<div class="accion">'+llamar+'</div>'
								+'<div class="alias">'+ value.avs_alias +'</div>'
								+'<div class="descripcion">'+value.avs_descripcion+'</div>'
								+'<div id="avsgaleria'+rel+'" class="galeria"></div>'
								+'<div class="detalle">'+value.avs_detalle+'</div>'
								+strtag
							+'</div>'
						+'</div>');
				} 
			});
		}
	});
}

function gotoLocation( id ){
    $(':mobile-pagecontainer').pagecontainer('change', '#mapa2');
    window.localStorage.setItem("mostrarmapa",id);
    $('#mapa2').prepend('<div id="loading"><img src="img/ajaxloader.gif" /></div>');
	//mostrarMapa(id);
}

function mostrarMapa(id){
	var session = window.localStorage.getItem("session");
    jQuery('#loading').remove();

	var image = {
		url: 'img/icono2.png',
		size: new google.maps.Size(20, 33),
		origin: new google.maps.Point(0,0),
		anchor: new google.maps.Point(10, 33)
	};
	$.ajax({
		type : "POST" ,
		url : "http://www.fav911.com/ws/fav911/getDireccion/" + id , 
		data : { "session" : session } ,
		dataType : "json" ,  
		cache : false,
		success : function(dato){
			i = 99999 ;
			jQuery('#mapacontent2').height(getRealContentHeight());
			var map = new google.maps.Map(document.getElementById('map2'), {
				center: {lat: parseFloat(dato.dir_lat),  lng: parseFloat(dato.dir_long) },
				zoom: 10,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});
			var mrkr = new google.maps.Marker({
				icon : image,
				map: map,
				position: new google.maps.LatLng( parseFloat(dato.dir_lat), parseFloat(dato.dir_long) ), map: map
			});
			if( verificar_session() ){
				var seguir = '<a class="gmapBtn gris" href="javascript:void(0);" onclick="return seguir2(\''+dato.dir_aviso+'\' );">Seguir</a><br />';
			}else{
				var seguir = '';
			}
           
           if(dato.usr_movil){
                seguir = seguir+'<a class="gmapBtn naranjo" href="tel:'+dato.usr_movil+'" >Llamar</a> ' ;
           }

			var infowindow = new google.maps.InfoWindow({
				content: seguir
			});
			
			mrkr.addListener('click', function() { infowindow.open(map, mrkr); }); 

			google.maps.event.addListener(infowindow, 'domready', function() {
			   var iwOuter = $('.gm-style-iw');
			   var iwBackground = iwOuter.prev();
			   iwBackground.children(':nth-child(2)').css({'display' : 'none'});
               iwBackground.children(':nth-child(3)').css({'display' : 'none'});
			   iwBackground.children(':nth-child(4)').css({'display' : 'none'});
			});
        }
    });
}

function gotoDeleteFav( id, buscar ){
	var session = window.localStorage.getItem("session");
    var r = confirm("Desea eliminar este anuncio de su lista de favoritos? ");
    if (r == true) {
        $.ajax({
            type: "POST",
            url: "http://www.fav911.com/ws/fav911/setFavorito/"+id, 
            data: {"session": session, "estado": "borrar" },
            dataType: "json",  
            cache:false,
            success: function(data){
                if ( buscar == 1 ){ 
                    jQuery('#aviso' + id ).find('.ui-btn-icon-left.ui-icon-delete.big-icon3').addClass('ui-icon-star')
						.removeClass('ui-icon-delete').attr("onclick"," gotoAddFav('"+id+"',1); ");
                }else{
                    jQuery('#aviso' + id ).slideUp( "slow", function() { $(this).remove() });
                }
            }
        });
    }
}

function gotoDeleteAnuncio( id ){
	var session = window.localStorage.getItem("session");
    var r = confirm("Desea eliminar este anuncio ? ");
    if (r == true) {
		$.ajax({
			type: "POST",
			url: "http://www.fav911.com/ws/fav911/delAnuncio/"+id, 
			data: {"session": session, "estado": "borrar" },
			dataType: "json",  
			cache:false,
			success: function(data){
                jQuery('#miaviso' + id ).slideUp( "slow", function() { $(this).remove() });
			}
		});
    }
}

function gotoAddFav( id, buscar ){
	var session = window.localStorage.getItem("session");
	$.ajax({
        type: "POST",
        url: "http://www.fav911.com/ws/fav911/setFavorito/"+id, 
        data: {"session": session, "estado": 1 },
        dataType: "json",  
        cache:false,
        success: function(data){
            Notify( data.msj ,'Mis Favoritos: ');
            jQuery('#aviso' + id ).find('.ui-btn-icon-left.ui-icon-star.big-icon3').addClass('ui-icon-delete')
                    .removeClass('ui-icon-star').attr("onclick"," gotoDeleteFav('"+id+"',1); ");
        }
    });
}

function seguir2( aviso_id ) {
	var session = window.localStorage.getItem("session");
    if( verificar_session() ){
        $.ajax({
            type : "POST",
            url : "http://www.fav911.com/ws/fav911/agregar_favorito", 
            data : { "session" : session, "fav_favorito" :  aviso_id },
            dataType: "json",
            cache : false,
            success : function ( data ) {
               Notify( data.msj ,'Mis Favoritos: ');
            }
        });
    }else{  
        gotohome();
    }
}

function seguir( aviso_id , i ) {
	var session = window.localStorage.getItem("session");
	infowindows[i].close();
	if( verificar_session() ){
		$.ajax({
			type : "POST",
			url : "http://www.fav911.com/ws/fav911/agregar_favorito", 
			data : { "session" : session, "fav_favorito" :  aviso_id },
			dataType: "json",
			cache : false,
			success : function ( data ) {
				Notify( data.msj ,'Mis Favoritos: ');
			}
		});
	}else{	
		gotohome();
	}
}

function gotohome() {
	$(':mobile-pagecontainer').pagecontainer('change', '#inicio'); 
	setTimeout(function () { $('#popupPadded').popup('open' );}, 500);
}
 
function getRealContentHeight() {
	var header = $.mobile.activePage.find("div[data-role='header']:visible");
	var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
	var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
	var viewport_height = $(window).height();
	var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
	if((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
		content_height -= (content.outerHeight() - content.height());
	} 
	return content_height;
}