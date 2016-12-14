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

        if($json!=null)
        {
            $arr_polygon = array('type' => 'FeatureCollection', 'features' => array());    //основание для массива полигонов

            foreach ($json['features'] as $key => $value) {
                if ($value['geometry']['type'] == 'Point') {
                    $array_point[] = $json['features'][$key];
                } else {
                    $arr_polygon['features'][] = $json['features'][$key];
                }
            }
            return [json_encode($arr_polygon), json_encode($array_point)];
        }
    }

    //возвращает true если участок есть в JSON файле
    function searhFieldToJSON($id,$json){
        $json=json_decode($json,true);

        if($json!=null)
        {
            foreach ($json['features'] as $value) {
                $key = array_search($id, $value);

                if($key!=null)
                {
                    return true;
                    break;
                }
            }
            return false;
        }
    }




}