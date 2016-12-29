var map, OSMLayer, mapView, drawLayer;                                  //слои карты
var geoJSON = new ol.format.GeoJSON();                                  //экземпляр класса geoJSON
//var posX, posY;                                                         //координаты щелчка мыши
var popup;                                                              //всплывающие окно объект

var elementPopup=document.getElementById('popup');                      //div контейнер всплывающее окно
var contentPopup = document.getElementById('popup-content');            //div контейнер содержимое всплывающего окна
var closerPopup = document.getElementById('popup-closer');              //значек закрыть всплывающее окно

var drawInter = null;                                                   //тип взаимодействия "рисование"
var selectInter = new ol.interaction.Select();                          //тип взаимодействия "выделить (выбрать)"
var modifyInter = null;                                                 //тип взаимодействия "модификация"
var selectCenter = new ol.interaction.Select();                         //тип взаимодействия "выделить (выбрать)" для программного выделения

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
    showJSON(arr_polygon_2, arr_point_2);

    //Слушаем событие клик по карте
    map.on('click', function(evt) {
        closePopup();                                       //скрыть выплывающее окно над маркером

        //если выбран контроллер "ручной выбор"
        if(document.getElementById('checkSelect').checked) {
            showInfoPopup(evt);                             //отобрразить всплывающее окно при клике по объекту
        }

        //если выбран контроллер "Маркер" (получаем координаты, добавляем маркер)
        /*if(document.getElementById('checkMarker').checked){
            var hdms = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
            posX=hdms[0];   //долгота
            posY=hdms[1];   //широта
            addMarker(posX,posY);   //добавляем маркер
        }*/
    });

    //Слушаем событие вождения мыщью по карте
    map.on("pointermove", function (evt){
        //если выбран контроллер "ручной выбор"
        if(document.getElementById('checkSelect').checked){
            changeCursor(evt);                              //Изменение курсора при наведении на объект
        }
    });

    //закрытие всплывающего окна по нажатию ссылки
    closerPopup.onclick = function() {
        closePopup();
    };

    if(fID!==undefined && fID!==null){
        showOnCenter(fID);
    }
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
        zoom: 13
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
        //getMarkerFromPoints(arr_point);
    }
}

//Задаем стиль полигонов при загрузке из файла
function setStylePolygonFromJSON(){
    var features = sourceDraw.getFeatures();

    for(var i=0;i<features.length;i++){
        if(features[i].get('name')==='Polygon') {
            setStyle(features[i]);
        }
    }
}

//задать стиль
function setStyle(feature){
    feature.setStyle(
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#000000',
                width: 3
            }),
            fill: new ol.style.Fill({
                color: feature.get('color')
            }),
            text: new ol.style.Text({
                text: feature.get('number'),
                scale: 1.5
            })
        }))
}

//Стиль при выделении
function setStyleSelect(feature){
    var selected = selectInter.getFeatures().getArray().indexOf(feature) >= 0;

    feature.setStyle(
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#00BFFF',
                width: 5
            }),
            fill: new ol.style.Fill({
                color: feature.get('color')
            }),
            text: new ol.style.Text({
                text: feature.get('number'),
                scale: 1.5
            })
        })
    );
}

//Функция рисования (полигон)
//hand-если равен true, полигон рисуется от руки
function drawInteraction(hand,id,number,description,color,transparency){
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
    if(transparency===undefined){
        color=0.7;
    }

    color=settingColor(color,transparency);

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
        setStyle(evt.feature);
    });

    if (drawInter !== null) {
        map.addInteraction(drawInter);     //добавляем графические данные (реализуем взаимодействие)
    }
}

//Быбор элемента на карте
function selectInteraction(){

    if (selectInter !== null) {
        map.addInteraction(selectInter);     //выбор объекта (реализуем взаимодействие)
    }

    //событие "выделение объекта по клику"
    selectInter.on('select',function(evt){
        //задаем стиль выделенного объекта
        if (evt.selected.length) {
            evt.selected.forEach(function(feature){
                setStyleSelect(feature);
            });
        }

        //задаем стиль объекту с которого снят выбор
        if (evt.deselected.length) {
            evt.deselected.forEach(function(feature){
                setStyle(feature);
            });
        }
    });
}

//Редактирование полигонов
function modifyInteraction(){
    map.addInteraction(selectCenter);
    modifyInter = new ol.interaction.Modify({
            features: selectCenter.getFeatures()
        });
    map.addInteraction(modifyInter);
}

//Добавляет маркер на карту по координатам
/*function addMarker(posX,posY,description){

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
}*/

//отобрразить всплывающее окно с информацией если кликнули по маркеру или полигону
function showInfoPopup(evt){
    //определяем был ли клик по объекту по разнице цветов пикселей слоев
    var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature){
            return feature;
        });
    setDataPopup(feature);                  //установки и отображение всплывающего окна

}

//задает данные для всплывающего окна и отображает или не отображает его
function setDataPopup(feature){
    if (feature){
        var coordinates = feature.getGeometry().getCoordinates();   //получаем координаты
        //если это маркер
        if(feature.get('name')=='Marker'){
            popup.setOffset([0,-45]);
            popup.setPosition(coordinates);                         //установка положения для всплывающего окна
            contentPopup.innerHTML=feature.get('description');
        }
        //если это полигон
        if(feature.get('name')=='Polygon'){
            popup.setOffset([0,0]);
            popup.setPosition(getCoordinatesMaxY(coordinates[0]));  //установка положения для всплывающего окна
            contentPopup.innerHTML="Номер: "+feature.get('number')+"<br>"+"Описание: "+feature.get('description');

            window.id=feature.getId();
            window.number=feature.get('number');

            contentPopup.innerHTML+="<br><br><a href='?fID="+window.id+"'class='btn btn-default btn-xs'>Информация</a>";
            contentPopup.innerHTML+="<input type='submit' value='Редактировать' class='btn btn-default btn-xs' onclick=\"modifyField(window.id,window.number)\"/>";
            contentPopup.innerHTML+="<input type='submit' value='Удалить' class='btn btn-default btn-xs' onclick=\"deleteField(window.id)\"/>";
        }
        $(elementPopup).popover({                                   //открываем окно
            placement: 'top',                                       //расположение окна
            html: true
        });
        $(elementPopup).popover('show');
    } else {
        $(elementPopup).popover('destroy');
        closePopup();
    }
}

//создаем всплывающие окно для вывода информации
function createPopup(){
    popup = new ol.Overlay({
        element: elementPopup,
        positioning: 'bottom-center',
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    });
    map.addOverlay(popup);
}

//закрыть всплывающее окно
function closePopup(){
    popup.setPosition(undefined);
    closerPopup.blur();
    return false;
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
    map.removeInteraction(selectCenter);
    $(elementPopup).popover('destroy');         //скрыть выплывающее окно над маркером
    closePopup();
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

//Добавить поле на карту
function AddFieldToMap(id,number,description){
    showPanelOperation('divAdd');
    document.getElementById('labelAdd').innerText="Добавляем участок №"+number;
    document.getElementById('btnAddSave').disabled = true;

    clearAllInteraction();

    var color=document.getElementById('selectColor');
    var transparency=document.getElementById('selectTransparency');
    transparency.disabled=true;


    color.onchange=function() {
        transparency.disabled=false;
        color.disabled=true;
        transparency.onchange=function(){
            if (color.value !== null && transparency.value != null) {
                document.getElementById('btnAddSave').disabled = false;
                transparency.disabled=true;

                drawInteraction(false, id, number, description, color.value, transparency.value);
            }
        }
    }
}

//сохранить отрисованное поле
function SaveAddField(){
    document.getElementById('PanelFieldInfo').style.display='block';
    document.getElementById('divAdd').style.display='none';

    sendJSON(fieldsJSON);
    location.reload();
}

//центрировать карту по координатам объекта с id
//вывести выплывающие окно с информацией и выделить объект
function showOnCenter(id_feature,pup){
    document.getElementById('checkSelect').checked=false;

    if(pup===undefined){
        pup=false;
    }
    closePopup();

    var feature=sourceDraw.getFeatureById(id_feature);                          //получаем объект по ID
    map.removeInteraction(selectInter);

    if(feature!=null){

        //Выделение объекта
        var ft = selectCenter.getFeatures({                                     //коллекция элементов select
            wrapX: false
        });
        var array=ft.getArray();                                                //массив элментов из коллекции
        for(var i=0; i<array.length; i++){
            var idd=array[i]['f'];                                              //идендификатор элемента коллекции
            var feat=sourceDraw.getFeatureById(idd);                            //получаем объект
            ft.pop(feat);                                                       //выталкиваем из набора выделенных
            setStyle(feat);                                                     //задаем стиль
        }
        ft.push(feature);                                                       //добавляем текущий элемент в набор выделенных
        setStyleSelect(feature);                                                //задаем стиль

        var extent = feature.getGeometry().getExtent();                         //получаем предатавление объекта (набор координат)

        var pan = ol.animation.pan({ source: mapView.getCenter()});             //анимированный переход при изменении центра
        var zoom = ol.animation.zoom({ resolution: mapView.getResolution()});   //анимированный переход при изменении масштаба
        map.beforeRender(pan, zoom);                                            //применяем параметры анимации
        mapView.fit(extent, map.getSize());                                     //устанавливаем геометрию просмотра
        mapView.setZoom(mapView.getZoom()-1);                                   //уменьшаем значение масштаба на 1 для смотрибельности

        //вывод всплывающего окна
        if(pup===true) {
            setDataPopup(feature);                                              //всплывающее окно
        }else {
            $(elementPopup).popover('destroy');
            closePopup();
        }

        map.on('click',function(){
            setStyle(feature);
            map.removeInteraction(selectCenter);
        })
    }
}

//редактировать участок
function modifyField(id,number){
    showPanelOperation('divModify');

    document.getElementById('labelModify').innerText="Изменяем участок №"+number;
    closePopup();

    showOnCenter(id);
    modifyInteraction();
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
    location.reload();
}

//события выбора checkBox
function checkBoxSelectActive(box){
    if(box.checked){
        clearAllInteraction();                      //очищаем все взаимодействия
        selectInteraction();
    }else{
        clearAllInteraction();                      //очищаем все взаимодействия
    }
}

//обработчик нажатия кнопки экспорт на панели
function btnClickExport(){
    showPanelOperation('divExport');
    document.getElementById('labelExport').innerText="Экспорт карты в PDF формат. Выберете размер и качество";
}

//экспорт карты в PDF
function exportPDF(){
    var dims = {
        a0: [1189, 841],
        a1: [841, 594],
        a2: [594, 420],
        a3: [420, 297],
        a4: [297, 210],
        a5: [210, 148]
    };

    var loading = 0;
    var loaded = 0;

    var exportButton = document.getElementById('btnExport');
    exportButton.disabled = true;                                           //делаем кнопку неактивной

    var format = document.getElementById('formatExport').value;
    var resolution = document.getElementById('resolutionExport').value;

    var dim = dims[format];                                                 //формат листа
    var width = Math.round(dim[0] * resolution / 25.4);                     //задаем качество
    var height = Math.round(dim[1] * resolution / 25.4);                    //экспортируемого изображения
    var size = (map.getSize());                                             //получаем размер карты
    var extent = map.getView().calculateExtent(size);                       //вычисляем экстенд

    var source = OSMLayer.getSource();                                      //слой ресурсов

    var tileLoadStart = function() {
        ++loading;
    };

    var tileLoadEnd = function() {
        ++loaded;
        if (loading === loaded) {
            var canvas = this;                                              //текущий фрагмент карты

            //выполнить один раз
            window.setTimeout(function() {
                loading = 0;
                loaded = 0;
                var data = canvas.toDataURL('image/png');
                var pdf = new jsPDF('landscape', undefined, format);
                pdf.addImage(data, 'JPEG', 0, 0, dim[0], dim[1]);           //
                pdf.save('map.pdf');                                        //имя сохраняемого файла

                source.un('tileloadstart', tileLoadStart);                  //не слушаем
                source.un('tileloadend', tileLoadEnd, canvas);              //следующие
                source.un('tileloaderror', tileLoadEnd, canvas);            //события

                map.setSize(size);                                          //задаем размер карты
                map.getView().fit(extent, size);                            //устанавливаем экстенд и размер
                map.renderSync();                                           //выполнить установки немедленно!!!
                exportButton.disabled = false;                              //делаем кнопку активной
                document.body.style.cursor = 'auto';                        //стандартный курсор
            }, 100);
        }

        //document.getElementById('PanelFieldInfo').style.display='block';
        //document.getElementById('divExport').style.display='none';
    };

    //слушаем события один раз
    map.once('postcompose', function(event) {
        source.on('tileloadstart', tileLoadStart);
        source.on('tileloadend', tileLoadEnd, event.context.canvas);
        source.on('tileloaderror', tileLoadEnd, event.context.canvas);
    });

    map.setSize([width, height]);
    map.getView().fit(extent, (map.getSize()));
    map.renderSync();


}

//Отображение панели операций (отрисовка участка, редактирование, экспорт)
function showPanelOperation(div){
    document.getElementById(div).style.display='block';
    document.getElementById('PanelFieldInfo').style.display='none';
    closePopup();
}

//получаем массив RGB+прозрачнасть
function settingColor(color, transparency){
    color=color.slice(1,color.length-1);
    var mas=color.split(',');
    return [Number(mas[0]),Number(mas[1]),Number(mas[2]),Number(transparency)]
}









