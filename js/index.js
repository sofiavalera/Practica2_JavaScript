var modal,// variable para las ventas de login y registro
    menuSignup, // variables de los elementos del menú
    menuLogin,
    menuSignout,
    menuloginUsername;

document.addEventListener("DOMContentLoaded", function () {
    /* botones del navBar */
    menuloginUsername = document.getElementById("menuloginUsername");
    menuSignout = document.getElementById("menuSignout");
    menuSignup = document.getElementById("menuSignup");
    menuLogin = document.getElementById("menuLogin");
    
    /* Al cargar la página por defecto ocultamos del menu los botones 
    con el nombre del usuario y la opción sign out*/
    menuloginUsername.style.display = 'none';
    menuSignout.style.display = 'none';
    
    /* abrir ventana registro*/
    menuSignup.onclick = function () {
        modal = document.getElementById('form-signup');
        modal.style.display = 'block';
    };

    /* abrir ventana login*/
    menuLogin.onclick = function () {
        modal = document.getElementById('form-login');
        modal.style.display = 'block';
    };
    
});

/* si pinchamos fuera de la ventana login/registro
 ocultamos las ventanas de login o registro*/
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

//----------------------------------------------------------- PARTE 1 ------------------------------------------------

//var numeroRandom=Math.floor(Math.random() * (7 - 1) + 1); //devolver un numero aleatorio
//crear options del select de los numeros de paginas
var select=document.getElementById("numPag");
var multiplos=[9,18,27,36,45,54,63,72]; //los valores que se muestran en el select

var user=obtenerCookie("nombreusuario");
numeroPagina=obtenerCookie("numImag_"+user);
if(obtenerCookie("sesion") != ""){ //si esta logueado

    console.log(numeroPagina);
    var urlGalery="http://thecatapi.com/api/images/get?format=xml&results_per_page="+numeroPagina;
    var urlCategory="xml/categorias.xml"; 
    
}else{ //si no

    var numeroPagina=9;
    var urlGalery="http://thecatapi.com/api/images/get?format=xml&results_per_page="+numeroPagina;
    var urlCategory="xml/categorias.xml";

}

var idUser=''; //inicializar IDuser 

//obtener el xml
function getXML(url){

    return new Promise(function(resolve, reject) {
        //Access-Control-Allow-Origin: *
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "document"; //formato XML
        xhr.onload = function() {
          var status = xhr.status;
          var readyState = xhr.readyState;
          if (status == 200 && readyState == 4) {
            resolve(xhr.response); //ya se llama a response aqui no hace falta llamarlo abajo
          } else {
            reject(status);
          }
        };
        xhr.send();
      });
}

getXML(urlCategory).then(function(xml) {  
        return crearObjetoCategorias(xml);
}).then(function(objetoXML) {
        imprimirCategory(objetoXML);
}).then(function() {
        return guardarValorOption(); 
}).then(function(url) { 
       return getXML(url);
}).then(function(xml) {
        return imagenes(xml);
}).then(function(arrImagenes) {
        mostrarGaleria(arrImagenes);
}), function(status) {
    alert('Error...');
}; 

//llamada a la funcion que crea las options del numero de imagenes
creacionOptionsNumImg(multiplos);
 
//constructor de categoria
function datosCategorias(nombre,id){
    this.nombre=nombre
}

//creacion de las opciones del select con las categorias
function crearObjetoCategorias(xml){
    
    //array con las categorias
    var arrCategory=[];
    //coger los datos del xml que nos interesan (name e id)
    var categoria=xml.getElementsByTagName("category");
    //variables 
    var nombre;
    
    for(var i=0; i<categoria.length; i++){ //se recorren las categorias

        nombre=categoria[i].getElementsByTagName("name")[0].childNodes[0].nodeValue; //se coga el nombre de la categoria
        
        var objetoCategoria = new datosCategorias(nombre);
        arrCategory.push(objetoCategoria);
    }  
    return arrCategory; //array nombre categoria
}

//funcion que imprime en un <select> con <options> el array de objetos de categorias
function imprimirCategory(arrObjetos){
    
    var option = document.createElement("option"); //creacion elemento option
    option.setAttribute("value", "Selecciona categoria") //el valor que va a ser "seleccionar categoria"
    option.setAttribute("selected",true); //salga seleccionado por defecto
    option.setAttribute("disabled",true); //desabilitado para que no lo puedan marcar
    var nodoOption=document.createTextNode("Selecciona categoria"); //el texto de la opcion
    option.appendChild(nodoOption); 
    document.getElementById("categ").appendChild(option); 
    
    for(var i=0; i<arrObjetos.length; i++){
        option = document.createElement("option"); //creacion elemento option
        option.setAttribute("value", arrObjetos[i].nombre) //el valor sea el nombre de la categoria
        nodoOption =  document.createTextNode(arrObjetos[i].nombre); //muestro el nombre
        option.appendChild(nodoOption); 
        document.getElementById("categ").appendChild(option); //aparezca dentro del select
        
    }
} 

function guardarValorOption(){
    
    var select = document.getElementById("categ");
      
    if(select.options[select.selectedIndex].value !== "Selecciona categoria"){ //para que no coja el valor de  "Selecciona categoria"
        var valorOp=select.options[select.selectedIndex].value; //sacar el valor de las options que han marcado
        //console.log(valorOp);
        urlGalery="http://thecatapi.com/api/images/get?format=xml&results_per_page="+numeroPagina+"&category="+valorOp;
        //console.log(urlGalery);      
          
        getXML(urlGalery).then(function(xml) {
            return imagenes(xml);
        }).then(function(arrImagenes) {
            console.log(arrImagenes);
            mostrarGaleria(arrImagenes);
        }), function(status) {
            alert('Error...');
        };                 
        
    }else{
        //console.log(urlGalery);
        return urlGalery;
    }

}

// URL de las imagenes
function imagenes(xml){
    var arrImagenes=document.getElementsByTagName("img");
    var imagenesDiv=document.getElementById("imag");
    if(document.getElementsByClassName("contenedor").length>0 ){ //si existe el div "contenedor"
       
        while(document.getElementsByClassName("contenedor").length>0){ //mientras sea mayor a 0
            
            document.getElementsByClassName("contenedor")[0].remove(); //borrame todos los div que haya
        }

    }
    
    var arrGaleria=[];
    var imagen=xml.getElementsByTagName("image"); //etiqueta imagen
    
    //variables 
    var imagenURL;
    
    for(var i=0; i<imagen.length; i++){ //se recorren las imagenes

        imagenURL=imagen[i].getElementsByTagName("url")[0].childNodes[0].nodeValue; //coger url imagenes
        arrGaleria.push(imagenURL);
    }
    return arrGaleria; //array con las URL de las imagenes
}

//funcion que crea las opciones con el numero de imagenes
function creacionOptionsNumImg(multiplos){
    
    for(var j=0; j<multiplos.length; j++){
    
        var user=obtenerCookie("nombreusuario");
        var cookieNumI=obtenerCookie("numImag_"+user);

        option = document.createElement("option"); //creacion elemento option

        if(multiplos[j] == cookieNumI){
           option.setAttribute("selected",true);
        }

        option.setAttribute("value", multiplos[j]) //el valor sea el nombre de la categoria
        nodoOption =  document.createTextNode(multiplos[j]); //muestro el nombre
        option.appendChild(nodoOption); 
        document.getElementById("numPag").appendChild(option); //aparezca dentro del select

    } 
}

//sacar el numero de paginas al hacer onchange
document.getElementById("numPag").addEventListener("change",function(e){
    e.preventDefault();  
    
    if(obtenerCookie("sesion") != ""){        
        numeroPagina=select.options[select.selectedIndex].value; 
        var user=obtenerCookie("nombreusuario");
        document.cookie="numImag_"+user+"="+numeroPagina;
        
   }else{
        numeroPagina=select.options[select.selectedIndex].value; 
        urlGalery="http://thecatapi.com/api/images/get?format=xml&results_per_page="+numeroPagina;
    }
    
    //llamada al xml para sacar las imagenes
    getXML(urlGalery).then(function(xml) {
            return imagenes(xml);
    }).then(function(arrImagenes) {
        console.log(arrImagenes);
        mostrarGaleria(arrImagenes);
    }), function(status) {
        alert('Error...');
    }; 
    
});

//mostrar galeria
function mostrarGaleria(arrImagenes){
    
    var d = document.getElementById("gallery"); 
    
    for(var i=0; i<numeroPagina; i++){ //recorre el array de las urls
        
        var div = document.createElement("div");
        div.className='col-lg-3 col-md-4 col-xs-6 card contenedor';
        d.appendChild(div);
        
        var imagen = document.createElement("img");
        imagen.setAttribute("src", arrImagenes[i]);
        imagen.className='img-fluid img-thumbnail like'+i;
        
        var divPrincipal = document.getElementById("gallery");
        divPrincipal.appendChild(div);
        div.appendChild(imagen);
        
        var div_pieImagen = document.createElement('div');
        div_pieImagen.className='card-body d-flex justify-content-between pie';
        div.appendChild(div_pieImagen);
        
        var div_icons = document.createElement('div');
        var iconoEstrella=document.createElement('i');
        iconoEstrella.className='far fa-star';
        iconoEstrella.innerHTML=1;
        var iconoMano=document.createElement('i');
        iconoMano.className='far fa-thumbs-up like'+i;
        iconoMano.innerHTML=12;
        
        //mostrar iconos y div que los contiene
        div_icons.appendChild(iconoEstrella);
        div_icons.appendChild(iconoMano);
        div_pieImagen.appendChild(div_icons);
        
        
    }
    
    //cuando hago click en el icono de megusta
    var numeroClicksLike=0;
    $("i.far.fa-thumbs-up").click(function() { //al hacer click en el icono de me gusta
        if(obtenerCookie("sesion") != ""){
            
                var contador= $(this).html(); //sacar el valor que tiene el icono
            
                if(numeroClicksLike%2==0){ //la primera vez entra por aqui
                    contador=parseInt(contador); 
                    contador++; //incremente en uno
                    numeroClicksLike++; 
                    $(this).removeClass('far fa-thumbs-up');
                    $(this).addClass('fa fa-thumbs-up');
                    
                    //sacar la clase del icono que se ha hecho click
                    var clasesLike=$(this).attr("class");
                    var clases=clasesLike.split(" ");
                    var claseLike=clases[0];
                    
                    //coger el src de la clase
                    var imagen=$('.'+claseLike).attr('src');
                    console.log(imagen);
                    
                    //creacion del objeto
                    var url = new Object();
                    
                    url.megusta=imagen;
                    url.idUser=idUser;
                    guardarLikes(url); //llamada a la funcion que lo guarda en el servidor
                    

                }else{
                    contador--; //decrementa uno
                    numeroClicksLike--;
                    $(this).removeClass('fa fa-thumbs-up');
                    $(this).addClass('far fa-thumbs-up');
                }
                
                $(this).text(contador); //muestre el valor increnentado o decrementado
           
        }else{
            alert("¡Tienes que estar logueado!");
        }

    });
    
    //cuando haga click en el icono de favorito
    var numeroClicksfav=0;
    $(".far.fa-star").click(function() {
        
         if(obtenerCookie("sesion") != ""){
            
              var contador= $(this).html();
            
                if(numeroClicksfav%2==0){
                    contador=parseInt(contador);
                    contador++;
                    numeroClicksfav++;
                    $(this).removeClass('far fa-star');
                    $(this).addClass('fa fa-star');

                }else{
                    contador--;
                    numeroClicksfav--;
                    $(this).removeClass('fa fa-star');
                    $(this).addClass('far fa-star');
                }
                $(this).text(contador);
         }else{
             alert("¡Tienes que estar logueado!");
         }
 
    });
        
}

// --------------------------------------------------- PRACTICA PARTE 2 -------------------------------------------

//obtener los datos del json
var usersServer='http://localhost:3000/usuarios'; //url del servidor usuarios
var likeServer='http://localhost:3000/megusta'; //url de likes
var datosUser=[];
var contadorId;

var getJSON = function(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      var readyState = xhr.readyState;
    //si hay respuesta del servidor    
      if (status == 200 && readyState==4) {
        resolve(xhr.response);
      } else {
        reject(status);
      }
    };
    xhr.send();
  });
};

//constructor de categoria
function constructorUsers(id,email,pass){
    this.id=id,
    this.email=email,
    this.pass=pass  
        
}

//llamada a la funcion JSON
getJSON(usersServer).then(function(json) {
    
    return sacarUsuarios(json);

}, function(status) {
    console.log(status); //estado
    alert('Error...');  //si no va bien
});


//sacar datos del JSON
function sacarUsuarios(json){
        
    for(let usuario of json){ 
        var id = usuario.id;
        var email = usuario.email;
        var pass = usuario.password;

        var objetoUsers = new constructorUsers(id,email,pass);
        datosUser.push(objetoUsers);

        contadorId=usuario.id; //sacar el ultimo valor de ID que esta en el JSON
    }
    return datosUser; 
}

/*-----------LOGIN Y REGISTO-----------*/
//cerrar sesion y borrar la cookie si existe de sesion
document.getElementById("menuSignout").addEventListener("click",function(e){
    e.preventDefault();  
    if(obtenerCookie("sesion") != ""){
        //borrar cookies de sesion
        document.cookie = 'sesion' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'nombreusuario' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'; 
        //para que recarge la pagina 
        window.location.replace("index.html");
        
    }
});


//comprobar que email y password coinciden con algun usuario del json
document.getElementById("buttonLogin").addEventListener("click",function(e){
                                                        
    e.preventDefault();

    var logueado=false;
    var emailUser=document.login.username.value;
    var cortarEmail= emailUser.split("@");
    var nombre= cortarEmail[0]; 
    
    var passUser=document.login.password.value;
    
    for(var i=0; i<datosUser.length;i++){
        if(emailUser === datosUser[i].email && passUser === datosUser[i].pass){ //si esta logueado
           logueado=true;
        } 
    }
    
    
    if(logueado){

        alert("Hola de nuevo "+emailUser);
        //creo cookie con el email
        comprobarCookie("nombreusuario", emailUser, 1);
        //creo una cookie de sesion
        document.cookie="sesion=creada";
        
        //cambio logIn por sign out y muestro nombre de usuario
        var registro= document.getElementById("menuSignup");
        var login= document.getElementById("menuLogin");
        var usuario= document.getElementById("menuloginUsername");
        var cerrarsesion= document.getElementById("menuSignout");
        registro.style.display='none';
        login.style.display='none';
        //usuario.innerHTML=obtenerCookie("nombreusuario");
        usuario.innerHTML=nombre;
        usuario.style.display='block';
        cerrarsesion.style.display='block';
    
        //hacer click en el boton me saque las imagenes que le gustan
        var buttonLike = document.getElementById("buttonLike");
        buttonLike.style.display='block';
        //muestra los me gusta cuando esta logueado
        //por defecto los mostramos para que idUser no nos de nulo y se puedan añadir las fotos a la primera                                            //que te loguees
        getJSON(likeServer).then(function(json) { 
                
            mostrarMegusta(json);
             
        }, function(status) {
            console.log(status); //estado
            alert('Error...');  //si no va bien
        }); 
        
        document.getElementById("buttonLike").addEventListener("click",function(e){

            getJSON(likeServer).then(function(json) {
                
                mostrarMegusta(json);
             
            }, function(status) {
                console.log(status); //estado
                alert('Error...');  //si no va bien
            }); 
        });
        //al hacer click en el boton de cerrar elimina los divs que contienen las imagenes
        document.getElementById("cerrarLike").addEventListener("click",function(e){
            e.preventDefault();
            ocultarMegusta();
            
        });
        
        //cuando tiene numero de paginas asignado
        var user=obtenerCookie("nombreusuario");
        var cookieNumPag=obtenerCookie("numImag_"+user);
        console.log(cookieNumPag);
        urlGalery="http://thecatapi.com/api/images/get?format=xml&results_per_page="+cookieNumPag;
    
        getXML(urlGalery).then(function(xml) {
            return imagenes(xml);
        }).then(function(arrImagenes) {
            console.log(arrImagenes);
            mostrarGaleria(arrImagenes);
        }), function(status) {
            alert('Error...');
        };  
        
        
    }else{
        alert("¡Este usuario no esta registrado!");
    }
});

//ocultar imagenes que le gustan
function ocultarMegusta(){
    /*var titulo=document.getElementById("tituloLike");
    titulo.remove();
    var contenedorImagenes=document.getElementsByClassName('contenImag')[0].className;
    contenedorImagenes.remove(); */
    $("#tituloLike").remove();
    $(".contenImag").remove();

    document.getElementById('buttonLike').style.display='block';
    document.getElementById('cerrarLike').style.display='none';  
    
}

//mostrar imagenes que le gustan
function mostrarMegusta(json){
    
    //mostrar las imagenes que le gustan al usuario logueado sacadas del JSON  
     var titulo = document.createElement("h1");
     titulo.textContent="Imágenes que te gustan";
     titulo.id="tituloLike";
     
     var d = document.getElementById("megusta"); 
     d.appendChild(titulo);

     document.getElementById('megusta').style.display='block';
     
    //scara el ID del usuario logueado
       for(var i=0; i<datosUser.length; i++){
            if(datosUser[i].email == obtenerCookie("nombreusuario")){
                idUser=datosUser[i].id; //sacar el id del usuario logueado
                break;
            }
        }
    //muestra la imagen con un boton borrar
      var contador=0;
      for(let megusta of json){ 
          
          if(idUser == megusta.idUser){
               contador++;
               //añado las urls a las imagenes
                var div = document.createElement("div");
                div.className='col-lg-3 col-md-4 col-xs-6 card contenImag';
                d.appendChild(div);

                var imagen = document.createElement("img");
                imagen.setAttribute("src", megusta.megusta);
                imagen.className='img-fluid img-thumbnail tamanioLike';

                var divPrincipal = document.getElementById("megusta");
                divPrincipal.appendChild(div);
                div.appendChild(imagen);

                var boton = document.createElement("button");
                boton.id="buttonDelete"+contador;
                var texto = document.createTextNode("BORRAR");
                boton.appendChild(texto);
                div.appendChild(boton);
                    
                //borrar elemento JSON al hacer click en el boton de borrar
                document.getElementById("buttonDelete"+contador).addEventListener("click",function(e){
                    console.log(megusta.megusta);
                    console.log(megusta.idUser);
                    console.log(megusta.id);
                    
                    var identificador = megusta.id;
                    dropJSON(identificador); //borrar imagen JSON
                });

          }
      }
    
    document.getElementById('buttonLike').style.display='none';
    document.getElementById('cerrarLike').style.display='block';

}

//registrar un usuario
document.getElementById("buttonRegistro").addEventListener("click",function(e){
                                                        
    e.preventDefault();
    
     var correcto=true;
     //password: 6 caracteres de longitud, una letra mayucula, una minuscula, numero y caracter
    //comprobar si las contraseñas son iguales
    var email,password, password2;
    password = document.registro.password.value;
    password2 = document.registro.pswrepeat.value;  

    if(password !== password2){
        correcto=false;
    }
    
    if(correcto){
        //mensaje si todos los datos son correctos
        alert("Se estan procesando sus datos...");
        //incrementa ID
        contadorId++;
        //creacion del objeto
        var usuario = new Object();
        
        usuario.id=contadorId;
        usuario.email=document.registro.username.value;
        usuario.password=document.registro.password.value;
        
        guardarJSON(usuario); //guardo datos del usuario en el json
    }else{
        //si las contraseñas no coinciden
        alert('Las contraseñas no coinciden. Corrigelas paras registrarte!');
    }
    return correcto; 
    
    
});

//mostrar u ocultar contraseña
var showPass=document.getElementById("show-passwd"); //cogemos el valor ckeck
//cuando le das a show password te muestre la contraseña
showPass.addEventListener("click",function(e){                                                  
   // e.preventDefault();
    var campoPassword=document.getElementById("password-signin"); //cogemos campo password
    
    if(showPass.checked){ //comprobamos si esta checkeado
        campoPassword.setAttribute("type","text"); 
    }else{
       campoPassword.setAttribute("type","password");
    }
    
});

/*------Funciones que añaden o borran elementos del JSON------*/

//borrar elementos del JSON 
function dropJSON(identificador){
    
    var xhr=new XMLHttpRequest();
    xhr.open("delete",likeServer+"/"+identificador);    
    xhr.setRequestHeader("Content-type","application/json");
          
    xhr.onload=()=>{
        var status=xhr.status;
        
        if(status === 200){
            alert("!Se ha borrado¡");
        }else{
            alert("!No es posible borrar la imagen¡");
        }
    } 
    
    xhr.send();
    
}

//funcion que guarda urls de las imagenes en el json
function guardarLikes(url){

    var xhr=new XMLHttpRequest();
    xhr.open("post",likeServer, true);
    xhr.setRequestHeader("Content-type","application/json");
    
    xhr.onload=()=>{
        var status=xhr.status;
        if(status === 201){
            alert("!Se ha añadido a me gusta¡");
        }else{
            alert("!Error al guardar los datos¡");
        }
    } 
    xhr.send(JSON.stringify({megusta: url.megusta, idUser: url.idUser}));
}

//funcion que guarda usuarios en el json
function guardarJSON(usuario){
 
    var xhr=new XMLHttpRequest();
    xhr.open("post",usersServer, true);
    xhr.setRequestHeader("Content-type","application/json");
    
    xhr.onload=()=>{
        var status=xhr.status;
        if(status === 201){
            
            alert("!Sus datos se han registrado correctamente¡");
        }else{
            alert("!Error al guardar los datos¡");
        }
    } 
    xhr.send(JSON.stringify({id: usuario.id, email: usuario.email, password: usuario.password}));
}

/*----------FUNCIONES DE COOKIES---------*/
//acceder al valor que tiene una cookie a partir del nombre que tiene.
function obtenerCookie(clave){  //se le pasa el nombre de la cookie
    
    var name = clave + "=";
    var ca = document.cookie.split(';'); //separar las cookies
    for(var i=0; i<ca.length; i++) { //tamaño total
        var c = ca[i];
        //nos devuelve el contenido que hay despues del nombre
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}
//creo la cookie
function crearCookie(clave, valor, diasexpiracion) {
    var d = new Date();
    d.setTime(d.getTime() + (diasexpiracion*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = clave + "=" + valor + "; " + expires;
}
//compruebo si existe
function comprobarCookie(clave, valor, diasexpiracion) {
    var resultado = obtenerCookie(clave);
    if (resultado!="") {
        // La cookie existe.
    }else{
        // La cookie no existe.
       crearCookie(clave,valor,diasexpiracion);
    }
}
