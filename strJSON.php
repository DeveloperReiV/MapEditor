<?php

class strJSON
{
    public $array_point = null;     //массив точек
    //public  $array_polygon = null;  //массив полигонов


    //получает строку формата JSON
    //после выполнения оставляет в исходной строке только массив полигонов
    //массив точек перезаписываеться в другой массив и удаляеться из исходного
    function get_array_polygon($json)
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
        return json_encode($json);
    }
}