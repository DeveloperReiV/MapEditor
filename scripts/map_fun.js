var map, OSMLayer, mapView, drawLayer;  //слои карты
var geoJSON = new ol.format.GeoJSON();  //экземпл€р класса geoJSON
var typeDraw;                           //тип графики выбранный на панели инструментов
var typeInteraction = null;             //ссылка на выбранный тип взаимодействи€

var sourceDraw = new ol.source.Vector({wrapX: false}); //источник графики дл€ векторного сло€

//»нициализаци€ карты при загрузке страницы
function initMap()
{
    //слой карты OpenStreetMap
    OSMLayer = new ol.layer.Tile({  //создание плитки карты
        source:new ol.source.OSM(), //данные карты берутьс€ из OpenStreetMap
        name: 'OpenStreetMap'
    });

    //слой графических данных
    drawLayer = new ol.layer.Vector({     //создаем векторный слой данных
        source: sourceDraw,               //берем данные из источника графики
        name:'Draw',
        format: geoJSON                   //храним данные в формате JSON
    });

    //вид карты (зум и координаты центра)
    mapView = new ol.View({
        center: ol.proj.fromLonLat([36.2754200,54.5293000]), //координаты  алуги
        zoom: 11
    });

    // онтейнер карты
    map = new ol.Map({
        target: 'map',
        layers:[OSMLayer,drawLayer],
        view: mapView
    });

    // онтроллер положени€ мыши на карте
    var controlMousePosition = new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(4),  //формат вывода данных (4 знака после зап€той)
        projection: 'EPSG:4326',                            //система координат
        className: 'posControlMousePosition'                //css класс
    });
    var controlFullScreen = new ol.control.FullScreen();    //контроллер отображени€ карты на весь экран
    var controlScaleLine = new ol.control.ScaleLine();      //контроллер отображени€ масштаба

    //добавл€ем контроллеры
    map.addControl(controlMousePosition);
    map.addControl(controlFullScreen);
    map.addControl(controlScaleLine);

    document.getElementById('noneToggle').checked = true;   //по умолчанию выбран инструмент "навигаци€"
}

//‘ункци€ рисовани€
function drawInteraction()
{
    if (typeDraw !== 'None') {
        //тип взаимодействи€ "создание графических данных"
        typeInteraction = new ol.interaction.Draw({
            source: sourceDraw,                     //рисовать здесь
            type: typeDraw                          //данные данного типа
        });
        map.addInteraction(typeInteraction);        //добавл€ем данные к карте
    }
}

//Ѕыбор элемента на карте
function selectInteraction(){
    //тип взаимодействи€ "выбор по клику мыши"
    typeInteraction = new ol.interaction.Select({
        condition: ol.events.condition.click
    });

    if (typeInteraction !== null) {
        map.addInteraction(typeInteraction);     //выбор объекта (реализуем взаимодействие)
    }
}

//выбор контроллера рисовани€ на панели управлени€
document.getElementById('controlToggle').onchange = function(){
    map.removeInteraction(typeInteraction);         //очищаем текущее взаимодействие
    drawInteraction();
};

//¬ыбор котроллера "выбрать"
document.getElementById('selectToggle').onchange = function(){
    map.removeInteraction(typeInteraction);         //очищаем текущее взаимодействие
    selectInteraction();
};

//выбор контроллера на понели рисовани€
function toggleControl(element) {
    typeDraw=element.value;
}

//получает параметры сло€ полигонов в JSON формате и отправл€ет обработчику
function sendJSON(){
    var json = geoJSON.writeFeatures(sourceDraw.getFeatures()); //считываем данные из источника графики в вормат JSON

    //отправл€ем данные методом POST php обработчику в index.php
    if(json) {
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: 'index.php',
            data: {
                item: json
            },
        });
    }
}

//отображает полигоны на основе данных из JSON
function showJSON(){
    if(dataJSON) {
        sourceDraw.addFeatures(geoJSON.readFeatures(dataJSON)); //считываем данные из JSON в источник графики дл€ векторного сло€
    }
}
