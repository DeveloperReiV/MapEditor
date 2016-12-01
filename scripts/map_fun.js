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
        center: ol.proj.transform([2.1833, 41.3833], 'EPSG:4326', 'EPSG:3857'),
        zoom: 6
    });

    //��������� �����
    map = new ol.Map({
        target: 'map',
        layers:[OSMLayer,drawLayer],
        view: mapView
    });

    document.getElementById('noneToggle').checked = true;   //�� ��������� ������ ���������� "���������"
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
