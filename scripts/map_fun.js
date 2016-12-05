var map, OSMLayer, mapView, drawLayer;  //слои карты
var geoJSON = new ol.format.GeoJSON();  //экземпляр класса geoJSON
var typeDraw;                           //тип графики выбранный на панели инструментов
var typeInteraction = null;             //ссылка на выбранный тип взаимодействия

var sourceDraw = new ol.source.Vector({wrapX: false, format: geoJSON}); //источник графики для векторного слоя

var posX, posY;                         //координаты щелчка мыши

//Инициализация карты при загрузке страницы
function initMap()
{
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

    //Контроллер положения мыши на карте
    var controlMousePosition = new ol.control.MousePosition({
        //coordinateFormat: ol.coordinate.toStringHDMS,  //формат вывода данных (4 знака после запятой)
        projection: 'EPSG:4326',                            //система координат
        className: 'posControlMousePosition'                //css класс
    });
    var controlFullScreen = new ol.control.FullScreen();    //контроллер отображения карты на весь экран
    var controlScaleLine = new ol.control.ScaleLine();      //контроллер отображения масштаба

    //добавляем контроллеры
    map.addControl(controlMousePosition);
    map.addControl(controlFullScreen);
    map.addControl(controlScaleLine);

    document.getElementById('noneToggle').checked = true;   //по умолчанию выбран инструмент "навигация"



        //событие клик по карте (получаем координаты)
        map.on('click', function(evt) {
            var hdms = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
            posX=hdms[0];   //долгота
            posY=hdms[1];   //широта

            if(document.getElementById('markerToggle').checked){
                addMarker(posX,posY);
            }
        });

}


//выбор контроллера на понели рисования
function toggleControl(element) {
    typeDraw=element.value;
}

//получает параметры слоя полигонов в JSON формате и отправляет обработчику
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

//отображает полигоны на основе данных из JSON
function showJSON(){
    if(dataJSON) {
        sourceDraw.addFeatures(geoJSON.readFeatures(dataJSON)); //считываем данные из JSON в источник графики для векторного слоя
    }
}

//Функция рисования
function drawInteraction(){
    if (typeDraw !== 'None') {
        //тип взаимодействия "создание графических данных"
        typeInteraction = new ol.interaction.Draw({
            source: sourceDraw,                     //рисовать здесь
            type: typeDraw                          //данные данного типа
        });
        map.addInteraction(typeInteraction);        //добавляем данные к карте
    }
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


function addMarker(posX,posY){
    map.removeInteraction(typeInteraction);

    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([posX,posY])),
        name: 'Marker',
        population: 4000,
        rainfall: 500
    });

    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon( ({
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: '../image/marker.png'
        }))
    });

    iconFeature.setStyle(iconStyle);
    sourceDraw.addFeature(iconFeature);
}





//выбор контроллера рисования на панели управления
document.getElementById('controlToggle').onchange = function(){
    map.removeInteraction(typeInteraction);         //очищаем текущее взаимодействие
    drawInteraction();
};

//Выбор котроллера "выбрать"
document.getElementById('selectToggle').onchange = function(){
    map.removeInteraction(typeInteraction);         //очищаем текущее взаимодействие
    selectInteraction();
};

