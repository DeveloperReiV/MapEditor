var map, OSMLayer, mapView, drawLayer;                                  //слои карты
var geoJSON = new ol.format.GeoJSON();                                  //экземпляр класса geoJSON
var posX, posY;                                                         //координаты щелчка мыши
var popup;                                                              //всплывающие окно объект
var elementPopup=document.getElementById('popup');                      //div контейнер всплывающее окно

var drawInter = null;                                             //тип взаимодействия "рисование"
var selectInter = new ol.interaction.Select();                    //тип взаимодействия "выделить (выбрать)"
var modifyInter = null;                                           //тип взаимодействия "модификация"
var colorDefault=[173,216,230,.5];

//источник графики для векторного слоя
var sourceDraw = new ol.source.Vector({
    wrapX: false,
    format: geoJSON
});


//нициализация карты при загрузке страницы
function initMap(){
    createMAP();                                            //создаем карту
    addControlToMap();                                      //добавляем контроллеры управления
    createPopup();                                          //зоздаем всплывающие окно для вывода информации
    //document.getElementById('noneToggle').checked = true;   //по умолчанию выбран инструмент "навигация"


    //Слушаем событие клик по карте
    map.on('click', function(evt) {
        $(elementPopup).popover('destroy');         //скрыть выплывающее окно над маркером

        //если выбран контроллер "выбрать"
        if(document.getElementById('selectToggle').checked) {
            showInfoPopup(evt);                    //отобрразить всплывающее окно при клике по объекту
        }

        //если выбран контроллер "Маркер" (получаем координаты, добавляем маркер)
        if(document.getElementById('markerToggle').checked){
            var hdms = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
            posX=hdms[0];   //долгота
            posY=hdms[1];   //широта
            addMarker(posX,posY);   //добавляем маркер
        }
    });

    //Слушаем событие вождения мыщью по карте
    map.on("pointermove", function (evt){

        //если выбран контроллер "выбрать" или "редактировать"
        if(document.getElementById('selectToggle').checked || document.getElementById('modifyToggle').checked){
            changeCursor(evt);          //Изменение курсора при наведении на объект
        }
    });
}

//создание карты со слоем OSM и графическим слоем
function createMAP(){

    //слой карты OpenStreetMap
    OSMLayer = new ol.layer.Tile({  //создание плитки карты
        source:new ol.source.OSM(), //данные карты беруться из OpenStreetMap
        name: 'OSM',
        preload: 4,
        title: 'OpenStreetMap'
    });

    //слой графических данных
    drawLayer = new ol.layer.Vector({     //создаем векторный слой данных
        source: sourceDraw,               //берем данные из источника графики
        name:'Draw',
        title: 'Графика',
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
        layers:[new ol.layer.Group({
            title:"Все слои",
            layers:[OSMLayer,drawLayer]
        })
        ],
        loadTilesWhileAnimating: true,
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
    var layerSwitcher = new ol.control.LayerSwitcher({      //контроллер управления отображением слоев
        tipLabel: 'Légende'
    });

    //добавляем контроллеры
    map.addControl(controlMousePosition);
    map.addControl(controlFullScreen);
    map.addControl(controlScaleLine);
    map.addControl(layerSwitcher);
}

//получает параметры слоя полигонов и маркеров в JSON формате и отправляет обработчику
function sendJSON(fileName){
    var json = geoJSON.writeFeatures(sourceDraw.getFeatures()); //считываем данные из источника графики в вормат JSON

    //отправляем данные методом POST php обработчику в index.php
    if(json != null) {
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: 'index.php',
            data: {
                item: json,
                fileName:fileName
            }
        });
    }
}

//отображает полигоны и маркеры на основе данных из JSON
function showJSON(arr_polygon, arr_point){

    if(arr_polygon != null && arr_polygon != "") {
        sourceDraw.addFeatures(geoJSON.readFeatures(arr_polygon)); //считываем данные из JSON в источник графики для векторного слоя
    }
    setStylePolygonFromJSON();
    if(arr_point != null && arr_point != ""){
        getMarkerFromPoints(arr_point);
    }
}

//Задаем стиль полигонов при загрузке из файла
function setStylePolygonFromJSON(){
    var features = sourceDraw.getFeatures();

    for(var i=0;i<features.length;i++){
        if(features[i].get('name')==='Polygon') {
            var color = features[i].get("color");
            var number = features[i].get("number");

            if(color!==undefined && number!==undefined) {
                style(features[i], color,number);
            }else{
                //style(features[i], colorDefault,null);
            }
        }
    }
}

//задать стиль
function style(feature,color,number){
    feature.setStyle(
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#000000',
                width: 3
            }),
            fill: new ol.style.Fill({
                color: color
            }),
            text: new ol.style.Text({
                text:number,
                scale: 1.5
            })
        }))
}

//Функция рисования (полигон)
//hand-если равен true, полигон рисуется от руки
function drawInteraction(hand,id,number,description,color){
    if(id===undefined){
        id=-1;
    }
    if(number===undefined){
        number=0;
    }
    if(description===undefined){
        description="Пусто";
    }
    if(hand===undefined){
        hand=false;
    }
    if(color===undefined){
        color='blue';
    }

    //тип взаимодействия "создание графических данных"
    drawInter = new ol.interaction.Draw({
        source: sourceDraw,                     //рисовать здесь
        type: "Polygon",                         //данные данного типа
        freehand: hand
    });

    //Задаем свойства полигона
    drawInter.on('drawend', function(evt){
        evt.feature.setProperties({
            name: 'Polygon',
            number: number,
            description: description,
            color: color
        });
        evt.feature.setId(id);
        style(evt.feature,color);
    });

    if (drawInter !== null) {
        map.addInteraction(drawInter);     //добавляем графические данные (реализуем взаимодействие)
    }
}

//Быбор элемента на карте
function selectInteraction(select,feature){
    if (select !== null) {
        map.addInteraction(selectInter);     //выбор объекта (реализуем взаимодействие)
    }

    if(feature!==undefined){
        var ft=select.getFeatures({
            wrapX: false
        });
        ft.push(feature);
    }

    /*selectInter.on('select',function(evt){
        var col;
        if(evt['selected'][0].get('color')===undefined){
            col=colorDefault;
        }else{
            col=evt['selected'][0].get('color');
        }

        var styleSelect = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#00BFFF',
                width: 5
            }),
            fill: new ol.style.Fill({
                color: col
            })
        });
        evt['selected'][0].setStyle(styleSelect);
    });*/
}

//Редактирование полигонов
function modifyInteraction(){
    selectInter = new ol.interaction.Select({
        wrapX: false
    });
    map.addInteraction(selectInter);

    modifyInter = new ol.interaction.Modify({
        features: selectInter.getFeatures()
    });

    map.addInteraction(modifyInter);
}

//Добавляет маркер на карту по координатам
function addMarker(posX,posY,description){

    if(description===undefined){
        description="Маркер";
    }

    var iconFeature = new ol.Feature({                                  //создаем объект для векторного слоя
        geometry: new ol.geom.Point(ol.proj.fromLonLat([posX,posY])),   //тип объекта "точка"
        name: "Marker",
        description: description,
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
function getMarkerFromPoints(arr_point){
    arr_point=JSON.parse(arr_point);    //преобразуем JSON в массив объектов

    if(arr_point != null){
        for(var i=0;i<arr_point.length;i++){
            var x=arr_point[i]['geometry']['coordinates'][0];
            var y=arr_point[i]['geometry']['coordinates'][1];
            var description=arr_point[i]['properties']['description'];
            var coor=ol.proj.transform([x,y], 'EPSG:3857', 'EPSG:4326');

            addMarker(coor[0],coor[1], description);
        }
    }
}

//отобрразить всплывающее окно с информацией если кликнули по маркеру или полигону
function showInfoPopup(evt){
    //определяем был ли клик по объекту по разнице цветов пикселей слоев
    var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature){
            return feature;
        });

    //если объект не пуст (был клик по объекту)
    if (feature){
        var coordinates = feature.getGeometry().getCoordinates();   //получаем координаты
        var content;
        //если это маркер
        if(feature.get('name')=='Marker'){
            popup.setOffset([0,-45]);
            popup.setPosition(coordinates);                         //установка положения для всплывающего окна
            content=feature.get('description');
        }
        //если это полигон
        if(feature.get('name')=='Polygon'){
            popup.setOffset([0,0]);
            popup.setPosition(getCoordinatesMaxY(coordinates[0]));  //установка положения для всплывающего окна
            content="Номер: "+feature.get('number')+"<br>"+"Описание: "+feature.get('description');
        }

        $(elementPopup).popover({                                   //открываем окно
            'placement': 'top',                                     //Расположение окна
            'html': true,
            'content': content                                      //содержимое
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
        stopEvent: false
    });
    map.addOverlay(popup);
}

//вернуть из массива координат пару координат с максимальным значением по оси Y
function getCoordinatesMaxY(mas){
    var max=mas[0];
    for(var i=1;i<mas.length;i++){
        if(max[1]<mas[i][1]){
            max=mas[i];
        }
    }
    return max;
}

//Очистить все типы взаимодействия
function clearAllInteraction(){
    map.removeInteraction(drawInter);
    map.removeInteraction(selectInter);
    map.removeInteraction(modifyInter);
}

//Изменить курсор
function changeCursor(evt){
    var target = map.getTarget();                                               //получаем цель
    var jTarget = typeof target === "string" ? $("#"+target) : $(target);       //определяем тип цели
    var mouseCoordInMapPixels = [evt.originalEvent.offsetX, evt.originalEvent.offsetY];

    var hit = map.forEachFeatureAtPixel(mouseCoordInMapPixels, function(){      //определяем координаты мыши
        return true;
    });

    if (hit) {
        jTarget.css("cursor", "pointer");
    } else {
        jTarget.css("cursor", "");
    }
}

//Выбор контроллера "навигация"
document.getElementById('noneToggle').onchange = function(){
    clearAllInteraction();                      //очищаем все взаимодействия
};

//выбор контроллера "полигон"
document.getElementById('polygonToggle').onchange = function(){
    clearAllInteraction();                      //очищаем все взаимодействия
    drawInteraction();
};

//выбор контроллера "полигон от руки"
document.getElementById('polygonToggleHand').onchange = function(){
    clearAllInteraction();                      //очищаем все взаимодействия
    drawInteraction(true);
};

//Выбор контроллера "Редактировать"
document.getElementById('modifyToggle').onchange = function(){
    clearAllInteraction();                      //очищаем все взаимодействия
    modifyInteraction();
};

//Выбор котроллера "выбрать"
document.getElementById('selectToggle').onchange = function(){
    clearAllInteraction();                      //очищаем все взаимодействия
    selectInteraction(selectInter);
};

//Выбор контроллера "Маркер"
document.getElementById('markerToggle').onchange = function(){
    clearAllInteraction();                      //очищаем все взаимодействия
};

//Выбор любого контроллера
document.getElementById('controlToggle').onchange = function(){
    $(elementPopup).popover('destroy');         //скрыть выплывающее окно над маркером
};

//Добавить поле на карту
function AddFieldToMap(id,number,description){

    document.getElementById('divAdd').style.display='block';
    document.getElementById('PanelFieldInfo').style.display='none';
    document.getElementById('labelAdd').innerText="Добавляем участок №"+number;
    document.getElementById('btnAddSave').disabled = true;
    $(elementPopup).popover('destroy');

    var color=document.getElementById('selectColor');
    clearAllInteraction();

    color.onchange=function() {
        if (color.value !== null) {
            document.getElementById('btnAddSave').disabled = false;
            drawInteraction(false, id, number, description, color.value);
        }
    }
}

function SaveAddField(){
    document.getElementById('PanelFieldInfo').style.display='block';
    document.getElementById('divAdd').style.display='none';
    sendJSON(fieldsJSON);
    location.reload();
}

//центрировать карту по координатам объекта с id
//вывести выплывающие окно с информацией и выделить объект
function showOnCenter(id_feature,pup){
    if(pup===undefined){
        pup=false;
    }
    $(elementPopup).popover('destroy');

    var feature=sourceDraw.getFeatureById(id_feature);                  //получаем объект по ID
    map.removeInteraction(selectInter);

    if(feature!=null){
        var extent = feature.getGeometry().getExtent();                 //получаем предатавление объекта (набор координат)
        var coordinates = feature.getGeometry().getCoordinates();       //получаем координаты

        var pan = ol.animation.pan({ source: mapView.getCenter()});             //анимированный переход при изменении центра
        var zoom = ol.animation.zoom({ resolution: mapView.getResolution()});   //анимированный переход при изменении масштаба
        map.beforeRender(pan, zoom);                                            //применяем параметры анимации
        mapView.fit(extent, map.getSize());                                     //устанавливаем геометрию просмотра
        mapView.setZoom(mapView.getZoom()-1);                                   //уменьшаем значение масштаба на 1 для смотрибельности

        //Выделение объекта
        selectInteraction(selectInter,feature)

        //вывод всплывающего окна
        if(pup===true) {
            popup.setOffset([0, 0]);
            popup.setPosition(getCoordinatesMaxY(coordinates[0]));      //установка положения для всплывающего окна
            var content = "Номер: " + feature.get('number') + "<br>" + "Описание: " + feature.get('description');
            $(elementPopup).popover({                                   //открываем окно
                'placement': 'top',                                     //Расположение окна
                'html': true,
                'content': content                                      //содержимое
            });
            $(elementPopup).popover('show');
        }else {
            $(elementPopup).popover('destroy');
        }
    }

    map.on('click',function(){
        map.removeInteraction(selectInter);
    })
}

//редактировать участок
function modifyField(id,number){
    document.getElementById('divModify').style.display='block';
    document.getElementById('PanelFieldInfo').style.display='none';
    document.getElementById('labelModify').innerText="Изменяем участок №"+number;
    $(elementPopup).popover('destroy');
    showOnCenter(id);

    modifyInter = new ol.interaction.Modify({
        features: selectInter.getFeatures()
    });

    map.addInteraction(modifyInter);
}

//сохранить изменения после редактирования
function SaveModify(){
    document.getElementById('PanelFieldInfo').style.display='block';
    document.getElementById('divModify').style.display='none';
    clearAllInteraction();
    sendJSON(fieldsJSON);
}

//удаляем поле с карты
function deleteField(id){
    clearAllInteraction();                                      //очищаем все взаимодействия
    var feature=sourceDraw.getFeatureById(id);                  //получаем объект по ID
    sourceDraw.removeFeature(feature);                          //удаляем объект
    sendJSON(fieldsJSON);                                       //сохраняем файл
    location.reload();                                          //обновляем
}

//отмена операции добавления или редактирования
function cancelOperation(div){
    document.getElementById('PanelFieldInfo').style.display='block';
    document.getElementById(div).style.display='none';
    clearAllInteraction();
}









