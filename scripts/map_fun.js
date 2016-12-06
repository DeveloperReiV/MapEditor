var map, OSMLayer, mapView, drawLayer;  //���� �����
var geoJSON = new ol.format.GeoJSON();  //��������� ������ geoJSON
var typeDraw;                           //��� ������� ��������� �� ������ ������������
var typeInteraction = null;             //������ �� ��������� ��� ��������������

var sourceDraw = new ol.source.Vector({wrapX: false, format: geoJSON}); //�������� ������� ��� ���������� ����

var posX, posY;                         //���������� ������ ����

//������������� ����� ��� �������� ��������
function initMap()
{
    //���� ����� OpenStreetMap
    OSMLayer = new ol.layer.Tile({  //�������� ������ �����
        source:new ol.source.OSM(), //������ ����� �������� �� OpenStreetMap
        name: 'OpenStreetMap'
    });

    //���� ����������� ������
    drawLayer = new ol.layer.Vector({     //������� ��������� ���� ������
        source: sourceDraw,               //����� ������ �� ��������� �������
        name:'Draw',
        format: geoJSON,                   //������ ������ � ������� JSON
        projection: 'EPSG:4326',
        wrapX: false
    });

    //��� ����� (��� � ���������� ������)
    mapView = new ol.View({
        center: ol.proj.fromLonLat([36.2754200,54.5293000]), //���������� ������
        zoom: 11
    });

    //��������� �����
    map = new ol.Map({
        target: 'map',
        layers:[OSMLayer,drawLayer],
        view: mapView
    });

    //���������� ��������� ���� �� �����
    var controlMousePosition = new ol.control.MousePosition({
        //coordinateFormat: ol.coordinate.toStringHDMS,  //������ ������ ������ (4 ����� ����� �������)
        projection: 'EPSG:4326',                            //������� ���������
        className: 'posControlMousePosition'                //css �����
    });
    var controlFullScreen = new ol.control.FullScreen();    //���������� ����������� ����� �� ���� �����
    var controlScaleLine = new ol.control.ScaleLine();      //���������� ����������� ��������

    //��������� �����������
    map.addControl(controlMousePosition);
    map.addControl(controlFullScreen);
    map.addControl(controlScaleLine);

    document.getElementById('noneToggle').checked = true;   //�� ��������� ������ ���������� "���������"

    //������� ���� �� ����� (�������� ����������)
    map.on('click', function(evt) {
        var hdms = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        posX=hdms[0];   //�������
        posY=hdms[1];   //������

        if(document.getElementById('markerToggle').checked){    //���� ������ ������� "������"
            addMarker(posX,posY);   //��������� ������
        }
    });
}


//����� ����������� �� ������ ���������
function toggleControl(element) {
    typeDraw=element.value;
}

//�������� ��������� ���� ��������� � �������� � JSON ������� � ���������� �����������
function sendJSON(){
    var json = geoJSON.writeFeatures(sourceDraw.getFeatures()); //��������� ������ �� ��������� ������� � ������ JSON

    //���������� ������ ������� POST php ����������� � index.php
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

//���������� �������� � ������� �� ������ ������ �� JSON
function showJSON(){
    if(arr_polygon) {
        sourceDraw.addFeatures(geoJSON.readFeatures(arr_polygon)); //��������� ������ �� JSON � �������� ������� ��� ���������� ����
    }
    if(arr_point){
        getMarkerFromPoints();
    }
}

//������� ���������
function drawInteraction(){
    if (typeDraw !== 'None') {
        //��� �������������� "�������� ����������� ������"
        typeInteraction = new ol.interaction.Draw({
            source: sourceDraw,                     //�������� �����
            type: typeDraw                          //������ ������� ����
        });
        map.addInteraction(typeInteraction);        //��������� ������ � �����
    }
}

//����� �������� �� �����
function selectInteraction(){
    //��� �������������� "����� �� ����� ����"
    typeInteraction = new ol.interaction.Select({
        condition: ol.events.condition.click
    });

    if (typeInteraction !== null) {
        map.addInteraction(typeInteraction);     //����� ������� (��������� ��������������)
    }
}

//��������� ������ �� ����� �� �����������
function addMarker(posX,posY){
    map.removeInteraction(typeInteraction);                             //������� ������� ��������������

    var iconFeature = new ol.Feature({                                  //������� ������ ��� ���������� ����
        geometry: new ol.geom.Point(ol.proj.fromLonLat([posX,posY])),   //��� ������� "�����"
        name: 'Marker',
        population: 4000,
        rainfall: 500
    });

    var iconStyle = new ol.style.Style({    //������� �����
        image: new ol.style.Icon( ({        //�������� ������ � �����������
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: '../image/marker.png'
        }))
    });

    iconFeature.setStyle(iconStyle);        //������ ����� ������� iconFeature
    sourceDraw.addFeature(iconFeature);     //��������� ������ � �������� ������� ��� ���������� ����
}

//�������� ������� �� JSON ������ � ������������ ����� � ������� �� �����
function getMarkerFromPoints(){
    arr_point=JSON.parse(arr_point);    //����������� JSON � ������ ��������

    for(var i=0;i<arr_point.length;i++){
        var x=arr_point[i]['geometry']['coordinates'][0];
        var y=arr_point[i]['geometry']['coordinates'][1];
        var coor=ol.proj.transform([x,y], 'EPSG:3857', 'EPSG:4326');

        addMarker(coor[0],coor[1]);
    }
}

//����� ����������� ��������� �� ������ ����������
document.getElementById('controlToggle').onchange = function(){
    map.removeInteraction(typeInteraction);         //������� ������� ��������������
    drawInteraction();
};

//����� ���������� "�������"
document.getElementById('selectToggle').onchange = function(){
    map.removeInteraction(typeInteraction);         //������� ������� ��������������
    selectInteraction();
};

