<?php
mb_internal_encoding("UTF-8");
require_once('strJSON.php');
$file="drawing.json";
$strJSON=new strJSON();

if(file_exists($file)){
    $fileJSON = file_get_contents($file);       //считываем файл

    $arr=$strJSON->get_geometry($fileJSON);     //получаем массивы с полигонами и точками
    $arr_polygon=$arr[0];                       //полигоны
    $arr_point=$arr[1];                         //точки

    $json11=json_decode($arr_polygon,true);
    $json22=json_decode($arr_point,true);

}

if($_POST['item']) {
    $json=$_POST['item'];
    file_put_contents($file,$json);
}



?>

<html>
<head>
<title>MapEditor</title>
    <meta charset="utf-8">
    <link rel="stylesheet" href="style/ol.css" type="text/css">
    <link rel="stylesheet" href="style/style.css" type="text/css">
    <link rel="stylesheet" href="style/bootstrap.css" type="text/css">
    <link rel="stylesheet" href="style/bootstrap-theme.css" type="text/css">
    <link rel="stylesheet" href="style/ol3-layerswitcher.css" type="text/css">
</head>

<script type="text/javascript">
    var arr_polygon = '<?php echo $arr_polygon;?>'; //запись массивов
    var arr_point = '<?php echo $arr_point;?>';     //в переменную JavaScript
</script>


<body onload="initMap()" class="container-fluid">

<div class="row">
    <div class="col-xs-2">

        <div class="panel panel-primary">
            <div class="panel-heading">
                <h3 class="panel-title">Панель инструментов</h3>
            </div>
            <div class="panel-body" id="controlToggle">
                <div class="radio">
                    <label for="noneToggle" title="Навигация по карте при помощи мыши">
                        <input type="radio" name="type" value="None" id="noneToggle"/>
                        Навигация
                    </label>
                </div>

                <div class="radio">
                    <label for="polygonToggle" title="Активирует инструмент для рисования полигонов">
                        <input type="radio" name="type" value="Polygon" id="polygonToggle"/>
                        Полигон
                    </label>
                </div>

                <div class="radio">
                    <label for="modifyToggle" title="Инструмент редактирования (правка полигонов и перемещение маркиров)">
                        <input type="radio" name="type" value="Modify" id="modifyToggle"/>
                        Редактировать
                    </label>
                </div>

                <div class="radio">
                    <label for="selectToggle" title="Выбор объекта на карте и вывод информации">
                        <input type="radio" name="type" value="Select" id="selectToggle"/>
                        Выбрать
                    </label>
                </div>

                <div class="radio">
                    <label for="markerToggle" title="Активирует инструмент для нанесения маркера на карту">
                        <input type="radio" name="type" value="Marker" id="markerToggle"/>
                        Маркер
                    </label>
                </div>

                <div class="btn-group-vertical">
                    <input type="submit" value="Записать JSON" class="btn btn-default btn-sm" onclick="sendJSON()" title="Записывает все графические данные в JSON файл">
                    <input type="submit" value="Считать JSON" class="btn btn-default btn-sm" onclick="showJSON()" title="Считывает все графические данные из JSON файла и выводит на карту">
                </div>
            </div>
        </div>

    </div>

    <div class="col-xs-10">
        <div id="map" class="map"><div id="popup"></div></div>
    </div>

</div>

</body>

<script src="scripts/ol.js" type="text/javascript" charset="utf-8"></script>
<script src="scripts/jquery.js" type="text/javascript" charset="utf-8"></script>
<script src="scripts/bootstrap.js" type="text/javascript" charset="utf-8"></script>
<script src="scripts/map_fun.js" type="text/javascript" charset="utf-8"></script>
<script src="scripts/ol3-layerswitcher.js" type="text/javascript" charset="utf-8"></script>

</html>