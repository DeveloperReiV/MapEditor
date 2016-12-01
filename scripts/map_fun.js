var map, OSMLayer, mapView, drawLayer;  //слои карты
var geoJSON = new ol.format.GeoJSON();  //экземпляр класса geoJSON
var typeDraw;   //тип графики выбранный на панели инструментов
var drawing;    //хранит графические данные
var sourceDraw = new ol.source.Vector({wrapX: false}); //источник графики для векторного слоя

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
        format: geoJSON                   //храним данные в формате JSON
    });

    //вид карты (зум и координаты центра)
    mapView = new ol.View({
        center: ol.proj.transform([2.1833, 41.3833], 'EPSG:4326', 'EPSG:3857'),
        zoom: 6
    });

    //Контейнер карты
    map = new ol.Map({
        target: 'map',
        layers:[OSMLayer,drawLayer],
        view: mapView
    });

    document.getElementById('noneToggle').checked = true;   //по умолчанию выбран инструмент "навигация"
}

//создание и добавление графических данных
function addInteraction(){
    if (typeDraw !== 'None') {
        drawing = new ol.interaction.Draw({ //создаем графические данные
            source: sourceDraw,             //рисовать здесь
            type: typeDraw                  //данные данного типа
        });
        map.addInteraction(drawing);        //добавляем данные к карте
    }
}

//выбор контроллера на панели управления
document.getElementById('controlToggle11').onchange = function(){
    map.removeInteraction(drawing);         //удаляем данные с карты
    addInteraction();
}
addInteraction();


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
            },
        });
    }
}

//отображает полигоны на основе данных из JSON
function showJSON(){
    if(dataJSON) {
        sourceDraw.addFeatures(geoJSON.readFeatures(dataJSON)); //считываем данные из JSON в источник графики для векторного слоя
    }
}
