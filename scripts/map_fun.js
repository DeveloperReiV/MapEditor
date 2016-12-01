var map, OSMLayer, mapView, drawLayer;  //���� �����
var geoJSON = new ol.format.GeoJSON();  //��������� ������ geoJSON
var typeDraw;   //��� ������� ��������� �� ������ ������������
var drawing;    //������ ����������� ������
var sourceDraw = new ol.source.Vector({wrapX: false}); //�������� ������� ��� ���������� ����

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
        format: geoJSON                   //������ ������ � ������� JSON
    });

    //��� ����� (��� � ���������� ������)
    mapView = new ol.View({
        center: ol.proj.fromLonLat([36.2754200,54.5293000]), //���������� ������
        zoom: 11,
    });

    //��������� �����
    map = new ol.Map({
        target: 'map',
        layers:[OSMLayer,drawLayer],
        view: mapView
    });

    //���������� ��������� ���� �� �����
    var controlMousePosition = new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(4),  //������ ������ ������ (4 ����� ����� �������)
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

    var a=OSMLayer.getSource().getProjection().getCode();
    //alert(a);
}

//�������� � ���������� ����������� ������
function addInteraction(){
    if (typeDraw !== 'None') {
        drawing = new ol.interaction.Draw({ //������� ����������� ������
            source: sourceDraw,             //�������� �����
            type: typeDraw                  //������ ������� ����
        });
        map.addInteraction(drawing);        //��������� ������ � �����
    }
}

//����� ����������� �� ������ ����������
document.getElementById('controlToggle11').onchange = function(){
    map.removeInteraction(drawing);         //������� ������ � �����
    addInteraction();
}
addInteraction();


//����� ����������� �� ������ ���������
function toggleControl(element) {
    typeDraw=element.value;
}

//�������� ��������� ���� ��������� � JSON ������� � ���������� �����������
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
            },
        });
    }
}

//���������� �������� �� ������ ������ �� JSON
function showJSON(){
    if(dataJSON) {
        sourceDraw.addFeatures(geoJSON.readFeatures(dataJSON)); //��������� ������ �� JSON � �������� ������� ��� ���������� ����
    }
}
