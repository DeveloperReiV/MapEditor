<?php
$strJSON=new strJSON();

if(file_exists("lib/fields.json")){
    $file = file_get_contents("lib/fields.json");         //считываем файл
}

if($xml){
    foreach($xml->fields[0] as $item)
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
}


?>