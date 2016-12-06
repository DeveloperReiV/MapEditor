<?php
mb_internal_encoding("UTF-8");
require_once('strJSON.php');
$file="drawing.json";
$strJSON=new strJSON();

if(file_exists($file)) {
    $fileJSON = file_get_contents($file);  //считываем файл

    $arr=$strJSON->get_geometry($fileJSON);     //получаем массивы с полигонами и точками
    $arr_polygon=$arr[0];                       //полигоны
    $arr_point=$arr[1];                         //точки
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
</head>

<script type="text/javascript">
    var arr_polygon = '<?php echo $arr_polygon;?>'; //запись массивов
    var arr_point = '<?php echo $arr_point;?>';     //в переменную JavaScript
</script>


<body onload="initMap()" class="container-fluid">



<div align="center" class="row">

    <div class="col-xs-12">
        <div class="panel panel-primary">
            <div class="panel-heading">
                <h3 class="panel-title">Панель инструментов</h3>
            </div>
            <div class="panel-body">


                <ul id="controlToggle" style="display: inline-block;">
                    <li style="display: inline-block;">
                        <input type="radio" name="type" value="None" id="noneToggle" onclick="toggleControl(this);" checked="checked"/>
                        <label for="noneToggle">Навигация</label>
                    </li>
                    <li style="display: inline-block;">
                        <input type="radio" name="type" value="Polygon" id="polygonToggle" onclick="toggleControl(this);"/>
                        <label for="polygonToggle">Нарисовать полигон</label>
                    </li>
                </ul>

                <li style="display: inline-block;">
                    <input type="radio" name="type" value="Select" id="selectToggle""/>
                    <label for="selectToggle">Выбрать</label>
                </li>

                <li style="display: inline-block;">
                    <input type="radio" name="type" value="Marker" id="markerToggle""/>
                    <label for="markerToggle">Маркер</label>
                </li>


                <br/>

                <div class="btn-group">
                    <input type="submit" value="Записать JSON" class="btn btn-default btn-sm" onclick="sendJSON()">
                    <input type="submit" value="Считать JSON" class="btn btn-default btn-sm" onclick="showJSON()">
                <div>

            </div>
        </div>
    </div>

</div>

<div class="row">
    <div id="map" class="map" style="width:100%; height:70%"><div id="popup"></div></div>
    <div id="pos"></div>
</div>

</body>

<script src="scripts/ol.js" type="text/javascript"></script>
<script src="scripts/jquery.js" type="text/javascript"></script>
<script src="scripts/bootstrap.js" type="text/javascript"></script>
<script src="scripts/map_fun.js" type="text/javascript"></script>

</html>