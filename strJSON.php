<?php

class strJSON
{
    //получает строку формата JSON
    //возвращает две JSON строки
    //первая хранит JSON строку с полигонами и их свойства
    //вторая хранить JSON строку с точками и их свойства
    function get_geometry($json)
    {
        $json=json_decode($json,true);

        foreach($json['features'] as $key=>$value)
        {
            if($value['geometry']['type']=='Point')
            {
                $array_point[]=$json['features'][$key];
                unset($json['features'][$key]);
            }
        }
        return [json_encode($json),json_encode($array_point)];
    }
}