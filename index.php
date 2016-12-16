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


if(file_exists($fileJSON)){
    $file = file_get_contents($fileJSON);         //считываем файл
    $arrayJSON=$strJSON->get_geometry($file);     //получаем массивы с полигонами и точками
}

if(file_exists($fieldsJSON)){
    $file = file_get_contents($fieldsJSON);         //считываем файл
    $arrayFields=$strJSON->get_geometry($file);     //получаем массивы с полигонами и точками
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
    <link rel="stylesheet" href="style/ol.css" type="text/css" rel="stylesheet">
    <link rel="stylesheet" href="style/style.css" type="text/css" rel="stylesheet">
    <link rel="stylesheet" href="style/bootstrap.css" type="text/css" rel="stylesheet">
    <link rel="stylesheet" href="style/bootstrap-theme.css" type="text/css" rel="stylesheet">
    <link rel="stylesheet" href="style/ol3-layerswitcher.css" type="text/css" rel="stylesheet">
</head>

<script type="text/javascript">
    var arr_polygon_1 = '<?php echo $arrayJSON[0];?>';      //полигоны
    var arr_point_1 = '<?php echo $arrayJSON[1];?>';        //точки

    var arr_polygon_2 = '<?php echo $arrayFields[0];?>';    //полигоны
    var arr_point_2 = '<?php echo $arrayFields[1];?>';     //точки

    var fileJSON = '<?php echo $fileJSON;?>';
    var fieldsJSON = '<?php echo $fieldsJSON;?>';
</script>


<body onload="initMap()" class="container-fluid">

<div class="row">
    <div class="col-xs-2">

        <div class="panel panel-primary" id="PanelTool">
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
                    <label for="polygonToggleHand" title="Активирует инструмент для рисования полигонов">
                        <input type="radio" name="type" value="PolygonHand" id="polygonToggleHand"/>
                        Полигон от руки
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
                    <input type="submit" value="Считать JSON" class="btn btn-default btn-sm" onclick="showJSON(arr_polygon_1, arr_point_1)" title="Считывает все графические данные из JSON файла и выводит на карту">
                </div>
            </div>
        </div>

    </div>

    <div class="col-xs-10">
        <div id="map" class="map" style="height: 70%"><div id="popup" style="min-width: 300px;"></div></div>

        <div id="divModify" style="display: none">
            <label id="labelModify"></label><br>
            <div class="btn-group">
                <input type="submit" value="Сохранить изменения" class="btn btn-default btn-xs" onclick="SaveModify()"/>
                <input type="submit" value="Отмена" class="btn btn-default btn-xs" onclick="cancelOperation('divModify')"/>
            </div>
        </div><br>

        <div id="divAdd" style="display: none">
            <label id="labelAdd"></label><br>

            <label>Цвет</label>
            <select id="selectColor">
                <option>Выберете цвет</option>
                <option value='#0000FF' style="background: #0000FF;">Синий</option>
                <option value='#00FF00' style="background: #00FF00;">Зеленый</option>
                <option value='#FFFF00' style="background: #FFFF00;">Желтый</option>
                <option value='#FF0000' style="background: #FF0000;">Красный</option>
            </select>

            <div class="btn-group">
                <input type="submit" id="btnAddSave" value="Сохранить изменения" class="btn btn-default btn-xs" onclick="SaveAddField()"/>
                <input type="submit" value="Отмена" class="btn btn-default btn-xs" onclick="cancelOperation('divAdd')"/>
            </div>
        </div><br>

        <div class="panel panel-primary" id="PanelFieldInfo">
            <div class="panel-heading">
                <h3 class="panel-title">
                    Список полей в базе
                    <input type="submit" value="Показать на карте" class="btn btn-default btn-xs" onclick="showJSON(arr_polygon_2, arr_point_2)">
                </h3>
            </div>
            <div class="panel-body">
                <? if($strXML){
                    foreach($strXML->fields[0] as $item)
                    {
                    ?>
                        <div class="alert alert-info">
                            <strong>ID:       </strong><?=$item[id]?><br>
                            <strong>Номер:    </strong><?=$item->number?><br>
                            <strong>Описание: </strong><?=$item->description?><br><br>
                            <?
                            $file = file_get_contents($fieldsJSON);             //считываем файл
                            $res=$strJSON->searhFieldToJSON($item[id],$file);   //поиск объекта по ID в JSON

                            if($res!=true)
                            {
                            ?>
                                <input type="submit" value="Нарисовать на карте" class="btn btn-default btn-xs" onclick="AddFieldToMap('<? echo $item[id]?>','<? echo $item->number?>','<? echo $item->description?>')"/>
                            <?
                            }
                            else
                            {
                            ?>
                            <div class="btn-group">
                                <input type="submit" value="Показать" class="btn btn-default btn-xs" onclick="showOnCenter('<? echo $item[id]?>',true)"/>
                                <input type="submit" value="Редактировать" class="btn btn-default btn-xs" onclick="modifyField('<? echo $item[id]?>','<? echo $item->number?>')"/>
                                <input type="submit" value="Удалить" class="btn btn-default btn-xs" onclick="deleteField('<? echo $item[id]?>')"/>
                            </div>
                            <?
                            }
                            ?>
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