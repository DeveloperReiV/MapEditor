<?php
mb_internal_encoding("UTF-8");
require_once('lib/strJSON.php');
require_once('lib/fnXML.php');

$fieldsJSON="lib/fields.json";

$fileXML="lib/dataXML.xml";


$strJSON=new strJSON();
$XML=new fnXML();

$strXML=$XML->getXMLstring($fileXML);           //Получаем XML строку из файла

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
    var arr_polygon_2 = '<?php echo $arrayFields[0];?>';    //полигоны
    var arr_point_2 = '<?php echo $arrayFields[1];?>';     //точки

    var fileJSON = '<?php echo $fileJSON;?>';
    var fieldsJSON = '<?php echo $fieldsJSON;?>';
</script>


<body onload="initMap()" class="container-fluid">

<div class="row">
    <div class="col-xs-12">
        <div id="map" class="map" style="height: 70%"><div id="popup" style="min-width: 300px;" title="информация"></div></div><br>

<!--Панель редактирования поля -->
        <div id="divModify" style="display: none">
            <label id="labelModify"></label><br>
            <div class="btn-group">
                <input type="submit" value="Сохранить изменения" class="btn btn-default btn-xs" onclick="SaveModify()"/>
                <input type="submit" value="Отмена" class="btn btn-default btn-xs" onclick="cancelOperation('divModify')"/>
            </div>
        </div>
<!-- END Панель редактирования поля -->

<!--Панель добавления поля -->
        <div id="divAdd" style="display: none">
            <label id="labelAdd"></label><br>

            <label>Цвет</label>
            <select id="selectColor">
                <option>Выберете цвет</option>
                <option value='#0000FF' style="background: #0000FF;">Blue</option>
                <option value='#00FF00' style="background: #00FF00;">Green</option>
                <option value='#FFFF00' style="background: #FFFF00;">Yellow</option>
                <option value='#FF0000' style="background: #FF0000;">Red</option>
                <option value='#006400' style="background: #006400;">DarkGreen</option>
                <option value='#00FFFF' style="background: #00FFFF;">Cyan</option>
            </select>

            <div class="btn-group">
                <input type="submit" id="btnAddSave" value="Сохранить изменения" class="btn btn-default btn-xs" onclick="SaveAddField()"/>
                <input type="submit" value="Отмена" class="btn btn-default btn-xs" onclick="cancelOperation('divAdd')"/>
            </div>
        </div>
<!-- END Панель добавления поля  -->

<!--Панель экспорта-->
        <div id="divExport" style="display: none">
            <label id="labelExport"></label><br>

            <form class="form">
                <label>Размер листа</label>
                <select id="formatExport">
                    <option value="a0">A0 (долго)</option>
                    <option value="a1">A1</option>
                    <option value="a2">A2</option>
                    <option value="a3">A3</option>
                    <option value="a4" selected>A4</option>
                    <option value="a5">A5 (быстро)</option>
                </select>
                <label>Качество</label>
                <select id="resolutionExport">
                    <option value="72">72 dpi (быстро)</option>
                    <option value="150">150 dpi</option>
                    <option value="300">300 dpi (долго)</option>
                </select>
            </form>

            <div class="btn-group">
                <input type="submit" value="Экспорт" id="btnExport" class="btn btn-default btn-xs" onclick="exportPDF()"/>
                <input type="submit" value="Отмена" class="btn btn-default btn-xs" onclick="cancelOperation('divExport')"/>
            </div>
        </div>
<!--END Панель экспорта-->

        <div id="PanelFieldInfo">
<!--Инструменты-->
        <div class="alert alert-info" role="alert">
            <b><input type="checkbox" id="checkSelect"  onclick="checkBoxSelectActive(this)">Ручной выбор<b> |
            <input type="submit" value="Экспорнт в PDF" class="btn btn-default btn-xs" onclick="btnClickExport()"/> |
        </div>
<!--END Инструменты-->

<!--Список полей-->
        <div class="panel panel-primary">
            <div class="panel-heading">
                <h3 class="panel-title">
                    Список полей
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
                            if(file_exists($fieldsJSON))
                            {
                                $file = file_get_contents($fieldsJSON);             //считываем файл
                            }
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
<!-- END Список полей-->
        </div>


    </div>

</div>

</body>

<script src="scripts/ol.js" type="text/javascript" charset="utf-8"></script>
<script src="scripts/jquery.js" type="text/javascript" charset="utf-8"></script>
<script src="scripts/bootstrap.js" type="text/javascript" charset="utf-8"></script>
<script src="scripts/map_fun.js" type="text/javascript" charset="utf-8"></script>
<script src="scripts/ol3-layerswitcher.js" type="text/javascript" charset="utf-8"></script>
<script src="scripts/jspdf.min.js" type="text/javascript" charset="utf-8"></script>

</html>