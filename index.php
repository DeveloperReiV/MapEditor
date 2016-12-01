<?php
$file="drawing.json";

if(file_exists($file)) {
    $dataJSON = file_get_contents($file);  //считываем файл
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
</head>

<script type="text/javascript">
    var dataJSON='<?php echo $dataJSON;?>'; //строока JSON из файла записывается в переменную JavaScript
</script>


<body onload="initMap()">
<div id="map" class="map" style="width:100%; height:70%"></div>
<div align="center">
    <ul id="controlToggle">
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
    </li><br><br>

    <input type="submit" value="Записать JSON" onclick="sendJSON()">
    <input type="submit" value="Считать JSON" onclick="showJSON()">
</div>
</body>

<script src="scripts/ol.js" type="text/javascript"></script>
<script src="scripts/jquery.js" type="text/javascript"></script>
<script src="scripts/map_fun.js" type="text/javascript"></script>

</html>