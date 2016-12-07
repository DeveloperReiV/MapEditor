var map, OSMLayer, mapView, drawLayer;                                  //слои карты
var geoJSON = new ol.format.GeoJSON();                                  //экземпляр класса geoJSON
var typeInteraction = null;                                             //ссылка на выбранный тип взаимодействия
var sourceDraw = new ol.source.Vector({wrapX: false, format: geoJSON}); //источник графики для векторного слоя
var posX, posY;                                                         //координаты щелчка мыши
var popup;                                                              //всплывающие окно объект
var elementPopup=document.getElementById('popup');                      //div контейнер всплывающее окно

//нициализация карты при загрузке страницы
function initMap()
{
    createMAP();                                            //создаем карту
    addControlToMap();                                      //добавляем контроллеры управления
    createPopup();                                          //зоздаем всплывающие окно для вывода информации
    document.getElementById('noneToggle').checked = true;   //по умолчанию выбран инструмент "навигация"

    //Слушаем событие клик по карте
    map.on('click', function(evt) {
        $(elementPopup).popover('destroy');         //скрыть выплывающее окно над маркером

        if(document.getElementById('noneToggle').checked || document.getElementById('selectToggle').checked) {
            showPopupMarker(evt);                    //отобрразить всплывающее окно если кликнули по маркеру
        }

        //если выбран четбокс "Маркер" (получаем координаты, добавляем маркер)
        if(document.getElementById('markerToggle').checked){
            var hdms = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
            posX=hdms[0];   //долгота
            posY=hdms[1];   //широта
            addMarker(posX,posY);   //добавляем маркер
        }
    });




    /*map.on('pointermove', function(e) {
     if (e.dragging) {
     $(elementPopup).popover('destroy');
     return;
     }
     var pixel = map.getEventPixel(e.originalEvent);
     var hit = map.hasFeatureAtPixel(pixel);
     map.getTarget().style.cursor = hit ? 'pointer' : '';
     });*/
}

//создание карты со слоем OSM и графическим слоем
function createMAP(){

    //слой карты OpenStreetMap
    OSMLayer = new ol.layer.Tile({  //создание плитки карты
        source:new ol.source.OSM(), //данные карты беруться из OpenStreetMap
        name: 'OpenStreetMap'
    });

    //слой графических данных
    drawLayer = new ol.layer.Vector({     //создаем векторный слой данных
        source: sourceDraw,               //берем данные из источника графики
        name:'Draw',
        format: geoJSON,                   //храним данные в формате JSON
        projection: 'EPSG:4326',
        wrapX: false
    });

    //вид карты (зум и координаты центра)
    mapView = new ol.View({
        center: ol.proj.fromLonLat([36.2754200,54.5293000]), //координаты Калуги
        zoom: 11
    });

    //Контейнер карты
    map = new ol.Map({
        target: 'map',
        layers:[OSMLayer,drawLayer],
        view: mapView
    });
}

//добавить контроллеры к карте
function addControlToMap(){
    //Контроллер положения мыши на карте
    var controlMousePosition = new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.toStringHDMS,       //формат вывода данных (4 знака после запятой)
        projection: 'EPSG:4326',                            //система координат
        className: 'posControlMousePosition'                //css класс
    });

    var controlFullScreen = new ol.control.FullScreen();    //контроллер отображения карты на весь экран
    var controlScaleLine = new ol.control.ScaleLine();      //контроллер отображения масштаба

    //добавляем контроллеры
    map.addControl(controlMousePosition);
    map.addControl(controlFullScreen);
    map.addControl(controlScaleLine);
}

//получает параметры слоя полигонов и маркеров в JSON формате и отправляет обработчику
function sendJSON(){
    var json = geoJSON.writeFeatures(sourceDraw.getFeatures()); //считываем данные из источника графики в вормат JSON

    //отправляем данные методом POST php обработчику в index.php
    if(json) {
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: 'index.php',
            data: {
                item: json
            }
        });
    }
}

//отображает полигоны и маркеры на основе данных из JSON
function showJSON(){
    if(arr_polygon) {
        sourceDraw.addFeatures(geoJSON.readFeatures(arr_polygon)); //считываем данные из JSON в источник графики для векторного слоя
    }
    if(arr_point){
        getMarkerFromPoints();
    }
}

//Функция рисования (полигон)
function drawInteraction(){
    //тип взаимодействия "создание графических данных"
    typeInteraction = new ol.interaction.Draw({
        source: sourceDraw,                     //рисовать здесь
        type: "Polygon",                         //данные данного типа
    });

    //Задаем свойства полигона
    typeInteraction.on('drawend', function(e){
        e.feature.setProperties({
            'name': 'Площадь'
        })
    });

    map.addInteraction(typeInteraction);        //добавляем данные к карте
}

//Быбор элемента на карте
function selectInteraction(){
    //тип взаимодействия "выбор по клику мыши"
    typeInteraction = new ol.interaction.Select({
        condition: ol.events.condition.click
    });

    if (typeInteraction !== null) {
        map.addInteraction(typeInteraction);     //выбор объекта (реализуем взаимодействие)
    }
}

//Добавляет маркер на карту по координатам
function addMarker(posX,posY,name){

    if(name===undefined){
        name="Маркер";
    }
    map.removeInteraction(typeInteraction);                             //очищаем текущее взаимодействие

    var iconFeature = new ol.Feature({                                  //создаем объект для векторного слоя
        geometry: new ol.geom.Point(ol.proj.fromLonLat([posX,posY])),   //тип объекта "точка"
        name: name,
        //description: "bal",
        population: 4000,
        rainfall: 500
    });

    var iconStyle = new ol.style.Style({    //создаем стиль
        image: new ol.style.Icon( ({        //создание иконки с параметрами
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: '../image/marker.png'
        }))
    });

    iconFeature.setStyle(iconStyle);        //задаем стиль объекту iconFeature
    sourceDraw.addFeature(iconFeature);     //добавляем объект в источник графики для векторного слоя
}

//получаем маркеры из JSON строки с координатами точек и выводим на карту
function getMarkerFromPoints(){
    arr_point=JSON.parse(arr_point);    //преобразуем JSON в массив объектов

    for(var i=0;i<arr_point.length;i++){
        var x=arr_point[i]['geometry']['coordinates'][0];
        var y=arr_point[i]['geometry']['coordinates'][1];
        var name=arr_point[i]['properties']['name'];
        var coor=ol.proj.transform([x,y], 'EPSG:3857', 'EPSG:4326');

        addMarker(coor[0],coor[1], name);
    }
}

//отобрразить всплывающее окно если кликнули по маркеру
function showPopupMarker(evt){
    var feature = map.forEachFeatureAtPixel(evt.pixel,  //определяем был ли клик по маркеру по разнице цветов пикселей слоев
        function(feature){
            return feature;
        });

    //если клик был по маркеру
    if (feature){
        var coordinates = feature.getGeometry().getCoordinates();   //получаем координаты
        popup.setPosition(coordinates);                             //установка положения для всплывающего окна
        $(elementPopup).popover({                                   //открываем окно
            'placement': 'top',                                     //Расположение окна
            'html': true,
            'content': feature.get('name')                          //содержимое
        });
        $(elementPopup).popover('show');
    } else {
        $(elementPopup).popover('destroy');
    }
}

//создаем всплывающие окно для вывода информации
function createPopup(){
    popup = new ol.Overlay({
        element: elementPopup,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -50]
    });
    map.addOverlay(popup);
}

//выбор контроллера рисования на панели управления
document.getElementById('polygonToggle').onchange = function(){
    map.removeInteraction(typeInteraction);         //очищаем текущее взаимодействие
    drawInteraction();
};

//Выбор котроллера "выбрать"
document.getElementById('selectToggle').onchange = function(){
    map.removeInteraction(typeInteraction);         //очищаем текущее взаимодействие
    selectInteraction();
};

//Выбор контроллера "навигация"
document.getElementById('noneToggle').onchange = function(){
    map.removeInteraction(typeInteraction);         //очищаем текущее взаимодействие
};

//Выбор любого контроллера
document.getElementById('controlToggle').onchange = function(){
    $(elementPopup).popover('destroy');         //скрыть выплывающее окно над маркером
};

