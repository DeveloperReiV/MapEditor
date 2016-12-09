<?php
mb_internal_encoding("UTF-8");
require_once('lib/strJSON.php');
require_once('lib/fnXML.php');

$fileJSON="lib/drawing.json";
$fieldsJSON="lib/fields.json";
$fileXML="lib/dataXML.xml";


$strJSON=new strJSON();
$XML=new fnXML();

$strXML=$XML->getXMLstring($fileXML);           //Получаем XML строку из файла


//Если приняты данные AJAX для считывания из файла
if($_POST['fileField']){
    $flname=$_POST['fileField'];

    if(file_exists($flname)){
        $file = file_get_contents($flname);         //считываем файл
        $arr=$strJSON->get_geometry($file);         //получаем массивы с полигонами и точками
        $arr_polygon=$arr[0];                       //полигоны
        $arr_point=$arr[1];                         //точки
    }
}


//Если приняты данные AJAX для записи в файл
if($_POST['item'] && $_POST['fileName']){
    $json=$_POST['item'];                       //данные
    $fileName=$_POST['fileName'];               //имя файла
    file_put_contents($fileName,$json);         //записываем в файл
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

    var fileJSON = '<?php echo $fileJSON;?>';
    var fieldsJSON = '<?php echo $fieldsJSON;?>';
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
                    <input type="submit" value="Записать JSON" class="btn btn-default btn-sm" onclick="sendJSON(fileJSON)" title="Записывает все графические данные в JSON файл">
                    <input type="submit" value="Считать JSON" class="btn btn-default btn-sm" onclick="setFileNameForDisplay(fileJSON);" title="Считывает все графические данные из JSON файла и выводит на карту">
                </div>
            </div>
        </div>

    </div>

    <div class="col-xs-10">
        <div id="map" class="map" style="height: 50%"><div id="popup" style="min-width: 300px;"></div></div><br>

        <div class="panel panel-primary" id="PanelFieldInfo">
            <div class="panel-heading">
                <h3 class="panel-title">
                    Список полей в базе
                    <input type="submit" value="Показать на карте" class="btn btn-default btn-xs" onclick="setFileNameForDisplay(fieldsJSON)">
                </h3>
            </div>
            <div class="panel-body">
                <? if($strXML){
                    foreach($strXML->fields[0] as $item)
                    {
                    ?>
                        <div class="alert alert-info">
                            <strong>ID: </strong><?=$item[id]?><br>
                            <strong>Номер: </strong><?=$item->number?><br>
                            <strong>Описание: </strong><?=$item->description?><br><br>
                            <input type="submit" value="Нарисовать на карте" class="btn btn-default btn-xs" onclick="AddFieldToMap(<? echo $item[id]?>,<? echo $item->number?>)">
                        </div>
                    <?
                    }
                } ?>
            </div>
        </div>

    </div>

</div>

</body>

<script src="scripts/ol.js" type="text/javascript" charset="utf-8"></script>
<script src="scripts/jquery.js" type="text/javascript" charset="utf-8"></script>
<script src="scripts/bootstrap.js" type="text/javascript" charset="utf-8"></script>
<script src="scripts/map_fun.js" type="text/javascript" charset="utf-8"></script>
<script src="scripts/ol3-layerswitcher.js" type="text/javascript" charset="utf-8"></script>

</html>